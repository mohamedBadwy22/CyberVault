import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";
import { AdminRecord } from "@/src/types/types";

/**
 * POST /api/dashboardAPI
 * Proxies → GET /api/v1/users
 *
 * Backend returns paginated list of users.
 * Maps to AdminRecord type.
 */
export async function POST(request: Request) {
  try {
    const { page, filter } = await request.json();

    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      ...(filter !== "All" && { role: filter }),
    });

    const { data, pagination } = await backendFetch<{
      id: number;
      bankUserId: string;
      name: string;
      email: string;
      role: string;
      account?: { accountNumber: string };
    }[]>(`/users?${params.toString()}`);

    if (!data || data.length === 0) {
      return NextResponse.json({ ok: false, finished: true, data: [] });
    }

    const adminRecords: AdminRecord[] = data.map((user) => ({
      name: user.name,
      role: user.role as "admin" | "employee" | "user",
      id: user.bankUserId, // Map bankUserId to the display ID
      email: user.email,
      accountNumber: user.account?.accountNumber || null,
    }));

    const isLastPage = pagination
      ? page >= pagination.pages
      : data.length < 10;

    return NextResponse.json({ ok: true, data: adminRecords, finished: isLastPage });
  } catch (err) {
    return NextResponse.json(
      { ok: false, finished: true, error: apiErrorResponse(err).error },
      { status: 400 },
    );
  }
}