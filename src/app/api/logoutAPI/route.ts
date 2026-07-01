import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse, ApiError } from "@/src/lib/backendClient";

export async function POST() {
  // Access + refresh tokens live inside the encrypted NextAuth session cookie,
  // which the client clears via signOut() right after this call — so there is no
  // separate token cookie to purge here (no cross-user bleed).
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
  }
}
