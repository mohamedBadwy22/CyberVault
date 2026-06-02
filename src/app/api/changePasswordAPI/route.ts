// src/app/api/changePasswordAPI/route.ts
// Proxies PATCH /api/v1/profile/password
//
// Backend spec §8.2:
//   Body:    { currentPassword: string, newPassword: string }
//   200:     { data: { message: 'Password updated successfully' } }
//   400:     VALIDATION_ERROR
//   401:     INVALID_CURRENT_PASSWORD
//
// After success, the backend also:
//   - Sets mustChangePassword = false in DB
//   - Writes a CHANGE_PASSWORD audit event

import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    const { data } = await backendFetch<{ message: string }>(
      "/profile/password",
      {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );

    return NextResponse.json({ ok: true, message: data.message });
  } catch (err) {
    const errResponse = apiErrorResponse(err);
    return NextResponse.json(
      { ok: false, message: errResponse.error.message, error: errResponse.error },
      { status: 400 }
    );
  }
}
