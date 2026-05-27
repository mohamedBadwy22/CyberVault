import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

/**
 * GET /api/profileAPI
 * Proxies → GET /api/v1/profile
 *
 * Transforms the backend's full profile object into the profileDataType shape
 * expected by the UI components. `phone` and `accountNumber` are already
 * decrypted by the backend before returning.
 *
 * Returns { ok: true, data: profileDataType } or { ok: false, error }
 */
export async function GET() {
  try {
    const { data } = await backendFetch<{
      id: number;
      bankUserId: string;
      name: string;
      email: string;
      phone: string;
      dateOfBirth: string;
      gender: string;
      role: string;
      mustChangePassword: boolean;
      department: {
        departmentName: string;
        departmentRegion?: string;
        departmentRole: "admin" | "employee";
        departmentSince: string;
        departmentStatus: "active" | "inactive";
      } | null;
      account: {
        accountNumber: string;
        accountType: string;
        currency: string;
        balance: number;
        accountStatus: string;
      } | null;
      createdAt: string;
    }>("/profile");

    return NextResponse.json({
      ok: true,
      data: {
        // profileDataType fields
        id: data.bankUserId,       // bankUserId is the user-facing "Bank ID"
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        // Pass account and department through for pages that need them
        account: data.account,
        department: data.department,
      },
    });
  } catch (err) {
    const errorBody = apiErrorResponse(err);
    return NextResponse.json({ ok: false, error: errorBody.error }, { status: 400 });
  }
}