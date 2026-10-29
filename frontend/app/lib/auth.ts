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
    const token = getToken();
    if (!token) {
      // Return default if not authenticated
      return {
        school_year: getCurrentSchoolYear(),
        current_term: "Term 1",
        status: "active",
        enrollment_is_open: false
      };
    }

    const res = await fetch(`${API_BASE}/api/admin/settings/academic-config`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });

    if (res.ok) {
      const data = await res.json();
      if (data.active) {
        cachedConfig = {
          school_year: data.active.school_year,
          current_term: data.active.current_term,
          status: data.active.status,
          enrollment_is_open: data.active.enrollment_is_open === 1
        };
        cacheTimestamp = now;
        return cachedConfig;
      }
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
