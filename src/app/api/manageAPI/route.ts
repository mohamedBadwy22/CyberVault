import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

/**
 * POST /api/manageAPI
 * Proxies → GET /api/v1/users/:id
 *
 * Backend returns the full user object including nested account or department.
 * Maps it to { profileData, secondaryData } expected by Management.tsx.
 */
export async function POST(request: Request) {
  try {
    const { searchParam, whoWeSearch } = await request.json();

    const { data } = await backendFetch<{
      id: number;
      bankUserId: string;
      name: string;
      email: string;
      phone: string;
      dateOfBirth: string;
      gender: string;
      role: string;
      department: Record<string, string> | null;
      account: Record<string, string> | null;
    }>(`/users/${encodeURIComponent(searchParam)}`);

    return NextResponse.json({
      ok: true,
      data: {
        profileData: {
          id: data.bankUserId, // display ID
          name: data.name,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
        },
        secondaryData: whoWeSearch === "user" ? data.account : data.department,
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: apiErrorResponse(err).error }, { status: 400 });
  }
}