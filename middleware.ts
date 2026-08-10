/**
 * middleware.ts
 * Next.js Edge Middleware — server-side route protection.
 *
 * Runs BEFORE a page is rendered. If the required cookie is missing
 * the user is redirected to the correct login page immediately,
 * with no flash of the protected page.
 *
 * Cookie → role mapping (set by /api/auth/* login routes):
 *   token         → student
 *   teacher_token → teacher
 *   admin_token   → admin | registrar | principal | accounting
 *
 * For admin sub-roles (registrar, principal, accounting) we do a
 * lightweight JWT payload decode (no signature verification — that
 * is already done by the Express backend on every API call).
 * The middleware only uses the role claim to redirect to the right
 * login page; it does NOT trust the claim for data access.
 */

import { NextRequest, NextResponse } from "next/server";

/* ── Route → required cookie mapping ────────────────────────── */
const PROTECTED: {
  pattern: RegExp;
  cookie: string;
  loginPath: string;
  /** Optional: role value(s) the admin_token must contain */
  roles?: string[];
}[] = [
  // Student dashboard
  {
    pattern:   /^\/dashboard(\/|$)/,
    cookie:    "token",
    loginPath: "/login",
  },
  // Teacher dashboard & profile
  {
    pattern:   /^\/teacher\/(dashboard|profile)(\/|$)/,
    cookie:    "teacher_token",
    loginPath: "/login",
  },
  // Admin dashboard (all admin sub-roles)
  {
    pattern:   /^\/admin\/dashboard(\/|$)/,
    cookie:    "admin_token",
    loginPath: "/login",
    roles:     ["admin"],
  },
  // Registrar dashboard
  {
    pattern:   /^\/admin\/registrar\/dashboard(\/|$)/,
    cookie:    "admin_token",
    loginPath: "/login",
    roles:     ["registrar"],
  },
  // Principal dashboard
  {
    pattern:   /^\/admin\/principal\/dashboard(\/|$)/,
    cookie:    "admin_token",
    loginPath: "/login",
    roles:     ["principal"],
  },
  // Admin profile
  {
    pattern:   /^\/admin\/profile(\/|$)/,
    cookie:    "admin_token",
    loginPath: "/login",
  },
  // Accounting dashboard
  {
    pattern:   /^\/accounting\/dashboard(\/|$)/,
    cookie:    "admin_token",
    loginPath: "/login",
    roles:     ["accounting"],
  },
];

/* ── Lightweight JWT payload decode (no verification) ───────── */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json   = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/* ── Middleware ──────────────────────────────────────────────── */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  for (const rule of PROTECTED) {
    if (!rule.pattern.test(pathname)) continue;

    const cookieValue = req.cookies.get(rule.cookie)?.value;

    // No cookie at all → redirect to login
    if (!cookieValue) {
      const loginUrl = new URL(rule.loginPath, req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role check for admin sub-routes
    if (rule.roles && rule.roles.length > 0) {
      const payload = decodeJwtPayload(cookieValue);
      const tokenRole = (payload?.role as string | undefined) ?? "";

      if (!rule.roles.includes(tokenRole)) {
        // Has an admin token but wrong role → redirect to admin login
        const loginUrl = new URL(rule.loginPath, req.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Cookie present (and role matches if required) → allow through
    break;
  }

  return NextResponse.next();
}

/* ── Matcher — only run middleware on these path prefixes ─────── */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teacher/dashboard/:path*",
    "/teacher/profile/:path*",
    "/admin/dashboard/:path*",
    "/admin/registrar/:path*",
    "/admin/principal/:path*",
    "/admin/profile/:path*",
    "/accounting/dashboard/:path*",
  ],
};
