import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("teacher_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const subject_id = req.nextUrl.searchParams.get("subject_id");
    if (!subject_id) {
      return NextResponse.json({ error: "subject_id parameter is required." }, { status: 400 });
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/teacher/attendance/${subject_id}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });

  } catch {
    return NextResponse.json({ error: "Could not connect to server." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("teacher_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/teacher/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });

  } catch {
    return NextResponse.json({ error: "Could not connect to server." }, { status: 503 });
  }
}
