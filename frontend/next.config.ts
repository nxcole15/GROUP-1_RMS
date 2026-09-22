import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ── Output file tracing root ─────────────────────────────────────────────
  // Fixes workspace root detection when multiple lockfiles exist
  outputFileTracingRoot: path.resolve(__dirname),

  // ── API proxy rewrites ───────────────────────────────────────────────────
  // BACKEND_URL is read server-side only (API routes / rewrites).
  // Public browser code must use NEXT_PUBLIC_API_URL instead.
  // (Removed deprecated serverRuntimeConfig / publicRuntimeConfig.)
  // In production the Next.js app and the Express backend run on separate
  // URLs. These rewrites let the browser call /proxy/* and Next.js will
  // forward those requests to the backend — avoiding CORS issues from the
  // browser side entirely.
  //
  // Usage: fetch('/proxy/api/auth/universal-login', ...) from client components.
  // The Next.js API routes already call BACKEND_URL directly, so they don't
  // need these rewrites.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    return [
      {
        source: "/proxy/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
