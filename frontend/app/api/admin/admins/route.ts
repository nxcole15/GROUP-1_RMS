import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    const backendRes = await fetch(`${BACKEND_URL}/api/admin/admins`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return NextResponse.json({ error: "Could not connect to server." }, { status: 503 });
  }
}
