import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Server-side runtime env vars ────────────────────────────────────────────
  // BACKEND_URL is used by Next.js API routes (server-side only) to reach
  // the Express backend. It is NOT exposed to the browser.
  serverRuntimeConfig: {
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:4000",
  },

  // ── Public env vars (available in the browser) ───────────────────────────
  publicRuntimeConfig: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  },

  // ── API proxy rewrites ───────────────────────────────────────────────────
  // In production the Next.js app and the Express backend run on separate
  // URLs. These rewrites let the browser call /proxy/* and Next.js will
  // forward those requests to the backend — avoiding CORS issues from the
  // browser side entirely.
  //
  // Usage: fetch('/proxy/api/auth/login', ...) from client components.
  // The Next.js API routes already call BACKEND_URL directly, so they don't
  // need these rewrites.
  outputFileTracingRoot: path.join(__dirname),

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
