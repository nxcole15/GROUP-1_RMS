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
