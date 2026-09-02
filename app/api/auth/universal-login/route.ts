import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/universal-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    const response = NextResponse.json(data, { status: 200 });

    // Set the right cookie based on role
    const isProd = process.env.NODE_ENV === "production";
    const adminRoles = ["admin", "super_admin", "principal", "registrar", "accounting"];

    if (data.role === "student") {
      response.cookies.set("token", data.token, { httpOnly: true, secure: isProd, sameSite: "lax", maxAge: 24 * 60 * 60 });
    } else if (data.role === "teacher") {
      response.cookies.set("teacher_token", data.token, { httpOnly: true, secure: isProd, sameSite: "lax", maxAge: 8 * 60 * 60 });
    } else if (adminRoles.includes(data.role)) {
      // All admin sub-roles (admin, principal, registrar, accounting) use the same cookie.
      // The JWT payload contains the specific role so the middleware can distinguish them.
      response.cookies.set("admin_token", data.token, { httpOnly: true, secure: isProd, sameSite: "lax", maxAge: 8 * 60 * 60 });
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Could not connect to server." }, { status: 503 });
  }
}
