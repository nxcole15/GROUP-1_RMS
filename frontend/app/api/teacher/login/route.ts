import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Forward the request to the Express backend
    const backendRes = await fetch(`${BACKEND_URL}/api/teacher/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Pass the response back to the browser
    // Also set the cookie so the browser has it
    const response = NextResponse.json(data, { status: 200 });
    response.cookies.set("teacher_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours in seconds
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Could not connect to server." },
      { status: 503 }
    );
  }
}
