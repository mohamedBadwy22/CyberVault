// src/app/api/unlockUserAPI/route.ts
// Proxies PATCH /api/v1/users/:id/unlock
//
// Backend spec §8.3 PATCH /users/:id/unlock:
//   200: { data: { message: 'User unlocked successfully' } }
//   404: USER_NOT_FOUND
//   Auth: admin only

import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse, ApiError } from "@/src/lib/backendClient";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "User id is required." } },
        { status: 400 }
      );
    }

    const { data } = await backendFetch<{ message: string }>(
      `/users/${encodeURIComponent(String(id))}/unlock`,
      { method: "PATCH" }
    );

    return NextResponse.json({ ok: true, message: data.message });
  } catch (err) {
    const errResponse = apiErrorResponse(err);
    const httpStatus = err instanceof ApiError ? err.httpStatus : 500;

    return NextResponse.json(
      { ok: false, error: errResponse.error },
      { status: httpStatus }
    );
  }
}
