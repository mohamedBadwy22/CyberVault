// src/app/api/transactionsHistoryAPI/route.ts
// Proxies GET /api/v1/transactions/history
//
// Backend spec §8.4 query params:
//   page    (default 1)
//   limit   (default 10, max 100)
//   type    (All | credit | debit | transfer) — "All" is omitted from query
//   startDate, endDate (YYYY-MM-DD) — optional
//   minAmount, maxAmount — optional
//
// Response data items match HistoryRecord type exactly per spec §8.4:
//   { id, type, amount, currency, destinationAccount, description, balanceAfter, createdAt }
//
// Note: destinationAccount is null for credit/debit, decrypted accountNumber for transfer.
// amount and balanceAfter are JS numbers (DECIMAL with decimalNumbers:true in Sequelize).

import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";
import { HistoryRecord } from "@/src/types/types";

export async function POST(request: Request) {
  try {
    const {
      page = 1,
      filter = "All",
      searchParam,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = await request.json();

    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      // Backend spec §8.4: type filter is lowercase; omit when "All"
      ...(filter !== "All" && { type: filter }),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(minAmount !== undefined ? { minAmount: String(minAmount) } : {}),
      ...(maxAmount !== undefined ? { maxAmount: String(maxAmount) } : {}),
    });

    // Default: caller's own history (spec §8.4 line 887).
    // Admin/employee managing a user pass that user's bankUserId — resolve it to a
    // userId and use the admin/employee-scoped endpoint (spec §8.4 line 888).
    // Without this the endpoint returns the caller's (empty) own history.
    let historyPath = `/transactions/history?${params.toString()}`;
    if (searchParam) {
      const lookup = new URLSearchParams({
        bankUserId: String(searchParam).trim(),
        limit: "1",
        page: "1",
      });
      const { data: users } = await backendFetch<{ id: number }[]>(
        `/users?${lookup.toString()}`
      );
      if (!users || users.length === 0) {
        return NextResponse.json({ ok: false, finished: true, data: [] });
      }
      historyPath = `/transactions/history/${users[0].id}?${params.toString()}`;
    }

    const { data, pagination } = await backendFetch<HistoryRecord[]>(historyPath);

    if (!data || data.length === 0) {
      return NextResponse.json({ ok: false, finished: true, data: [] });
    }

    const isLastPage = pagination ? page >= pagination.pages : data.length < 10;

    return NextResponse.json({
      ok: true,
      data,
      finished: isLastPage,
      pagination,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        finished: true,
        error: apiErrorResponse(err).error,
        data: [],
      },
      { status: 400 }
    );
  }
}
