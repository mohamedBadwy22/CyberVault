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

    const { data, pagination } = await backendFetch<HistoryRecord[]>(
      `/transactions/history?${params.toString()}`
    );

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
