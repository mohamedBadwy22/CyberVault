import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

/**
 * POST /api/changePasswordAPI
 * Proxies → PATCH /api/v1/profile/password
 *
 * Backend spec §8.2: body must be { currentPassword, newPassword }.
 * On success: sets mustChangePassword = false in DB, writes CHANGE_PASSWORD audit event.
 * On failure: returns INVALID_CURRENT_PASSWORD (401) or VALIDATION_ERROR (400).
 */
export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    const { data } = await backendFetch<{ message: string }>("/profile/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(apiErrorResponse(err), { status: 400 });
  }
}