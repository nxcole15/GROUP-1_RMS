import { NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 * Clears all auth cookies so the Next.js middleware no longer
 * grants access to protected routes after the user logs out.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear all three possible auth cookies
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("teacher_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
