import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("teacher_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/teacher/dashboard`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });

  } catch {
    return NextResponse.json({ error: "Could not connect to server." }, { status: 503 });
  }
}
