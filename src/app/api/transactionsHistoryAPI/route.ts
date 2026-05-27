import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";
import { HistoryRecord } from "@/src/types/types";

/**
 * POST /api/transactionsHistoryAPI
 * Proxies → GET /api/v1/transactions/history
 *
 * Backend spec §8.4 query params:
 *   page    (default 1)
 *   limit   (default 10, max 100)
 *   type    (All | credit | debit | transfer)
 *   startDate, endDate (YYYY-MM-DD) — optional, not yet surfaced in the UI
 *
 * Response data items match HistoryRecord type exactly:
 *   { id, type, amount, currency, destinationAccount, description, balanceAfter, createdAt }
 *
 * CRITICAL FIX (Mismatch 8):
 *   The old implementation called GET /users (dummyjson) and mapped user.bank.iban as
 *   account numbers — it was returning a user list, not transaction history at all.
 */
export async function POST(request: Request) {
  try {
    const { page = 1, filter = "All" } = await request.json();

    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      ...(filter !== "All" && { type: filter }),
    });

    const { data, pagination } = await backendFetch<HistoryRecord[]>(
      `/transactions/history?${params.toString()}`,
    );

    if (!data || data.length === 0) {
      return NextResponse.json({ ok: false, finished: true, data: [] });
    }

    const isLastPage = pagination
      ? page >= pagination.pages
      : data.length < 10;

    return NextResponse.json({ ok: true, data, finished: isLastPage, pagination });
  } catch (err) {
    return NextResponse.json(
      { ok: false, finished: true, error: apiErrorResponse(err).error },
      { status: 400 },
    );
  }
}