/**
 * lib/auth.ts
 * Central auth helpers — token storage, headers, route protection.
 */

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const API_BASE = API;

// ── Token storage ─────────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("inform_token");
}

export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("inform_role");
}

export function getUser<T = Record<string, unknown>>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("inform_user");
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

export function setAuth(token: string, role: string, user: Record<string, unknown>) {
  localStorage.setItem("inform_token", token);
  localStorage.setItem("inform_role",  role);
  localStorage.setItem("inform_user",  JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("inform_token");
  localStorage.removeItem("inform_role");
  localStorage.removeItem("inform_user");
  localStorage.removeItem("inform_accounting_active");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ── Request helpers ───────────────────────────────────────────────────────────
export function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
    credentials: "include",
  });

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data as T;
}

// ── Auth guard for manual fetch() call sites ─────────────────────────────────
// On a 401 (expired/invalid token), clear stored auth and redirect to the login
// page. Returns true when it handled a 401 so the caller can short-circuit. Use
// this inside `then(r => ...)` callbacks at call sites that aren't routed through
// apiFetch (e.g. handlers that inspect specific status codes).
export function handleAuth401(status: number): boolean {
  if (status !== 401) return false;
  clearAuth();
  if (typeof window !== "undefined") window.location.replace("/login");
  return true;
}

// ── School Year & Term ────────────────────────────────────────────────────────
export interface AcademicConfig {
  school_year: string;
  current_term: string;
  status: string;
  enrollment_is_open: boolean;
}

let cachedConfig: AcademicConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getAcademicConfig(): Promise<AcademicConfig> {
  // Return cached config if still fresh
  const now = Date.now();
  if (cachedConfig && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedConfig;
  }

  try {
    // Use public endpoint - no authentication required
    const res = await fetch(`${API_BASE}/api/public/academic-config`, {
      credentials: "include"
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      cachedConfig = {
        school_year: data.school_year,
        current_term: data.current_term,
        status: data.status || "active",
        enrollment_is_open: data.enrollment_is_open === 1 || data.enrollment_is_open === true
      };
      cacheTimestamp = now;
      return cachedConfig;
    }
  } catch (err) {
    console.error("Failed to fetch academic config:", err);
  }

  // Fallback to calculated school year
  return {
    school_year: getCurrentSchoolYear(),
    current_term: "Term 1",
    status: "active",
    enrollment_is_open: false
  };
}

function getCurrentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startYear = month >= 6 ? year : year - 1;
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
}

// Force refresh academic config (call after principal updates settings)
export function refreshAcademicConfig() {
  cachedConfig = null;
  cacheTimestamp = 0;
}

// ── Inactivity timeout hook ───────────────────────────────────────────────────
// Auto-logs out the user after `timeoutMs` of no activity (default 15 min).
// Call this inside any dashboard page once auth is confirmed.
export function useInactivityTimeout(enabled: boolean, timeoutMs = 15 * 60 * 1000) {
  // useEffect is a React hook — import it at call sites, but we keep the
  // logic here so every dashboard gets identical behaviour.
  // We export a plain function that sets up the listeners; call it in a
  // useEffect with [enabled] as the dependency.
  if (typeof window === "undefined" || !enabled) return;

  const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"] as const;
  let timer: ReturnType<typeof setTimeout>;

  function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      clearAuth();
      window.location.replace("/login");
    }, timeoutMs);
  }

  EVENTS.forEach(e => window.addEventListener(e, resetTimer));
  resetTimer();

  // Return a cleanup function so the caller's useEffect can return it
  return () => {
    clearTimeout(timer);
    EVENTS.forEach(e => window.removeEventListener(e, resetTimer));
  };
}
