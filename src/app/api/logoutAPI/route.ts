import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFetch, apiErrorResponse, ApiError } from "@/src/lib/backendClient";

export async function POST() {
  try {
    const { data } = await backendFetch<{ message: string }>("/auth/logout", {
      method: "POST",
    });

    return NextResponse.json({ ok: true, message: data.message });
  } catch (err) {
    const errResponse = apiErrorResponse(err);
    const httpStatus = err instanceof ApiError ? err.httpStatus : 500;

    return NextResponse.json(
      { ok: false, error: errResponse.error },
      { status: httpStatus }
    );
  } finally {
    // Clear the local token cache regardless of the backend outcome. A failed or
    // unreachable backend logout must never leave a valid token behind, or the
    // next user on this browser inherits it (cross-user bleed).
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
  }
}
