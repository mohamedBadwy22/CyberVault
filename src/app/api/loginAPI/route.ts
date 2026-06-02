// src/app/api/loginAPI/route.ts
// Proxies POST /api/v1/auth/login and returns the backend response envelope.
// Used by LoginForm to get rich error codes (ACCOUNT_LOCKED, ACCOUNT_INACTIVE, etc.)
// before handing off to NextAuth for session creation.
//
// Backend spec §7.2 & §8.1:
//   Body:   { bankUserId: string, password: string }
//   200:    { success: true, data: { accessToken, mustChangePassword, user: { id, bankUserId, name, role, email } } }
//   400:    ACCOUNT_INACTIVE
//   401:    INVALID_CREDENTIALS | ACCOUNT_LOCKED (error.details.remainingSeconds)

import { NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.BACKEND_URL ?? "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

export async function POST(request: Request) {
  try {
    const { bankUserId, password } = await request.json();

    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ bankUserId, password }),
    });

    const body = await res.json();

    if (!body.success) {
      // Forward the backend error envelope to the client as-is
      return NextResponse.json(
        { ok: false, error: body.error },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true, data: body.data });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Login request failed." },
      },
      { status: 500 }
    );
  }
}
