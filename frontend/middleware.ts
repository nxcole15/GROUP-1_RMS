/**
 * middleware.ts
 * Next.js Edge Middleware — server-side route protection.
 *
 * NOTE: This middleware is DISABLED for local development because
 * cookies don't work properly between localhost:3000 (frontend) and
 * localhost:4000 (backend) with sameSite:Strict.
 *
 * For production deployments (Vercel + Railway on same domain),
 * uncomment the middleware function below.
 */

import { NextResponse } from "next/server";

/* ── Middleware is disabled ──────────────────────────────────── */
export function middleware() {
  // Allow all requests through - auth is handled by frontend useEffect checks
  return NextResponse.next();
}

/* ── Matcher ─────────────────────────────────────────────────── */
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
