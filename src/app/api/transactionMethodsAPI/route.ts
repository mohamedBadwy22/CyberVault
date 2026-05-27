import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

/**
 * POST /api/transactionMethodsAPI
 * Proxies →
 *   POST /api/v1/transactions/credit   (method === 'credit')
 *   POST /api/v1/transactions/debit    (method === 'debit')
 *   POST /api/v1/transactions/transfer (method === 'transfer')
 *
 * CRITICAL FIX (Mismatch 9):
 *   The previous implementation calculated balances client-side and issued two separate
 *   PUT requests — a catastrophic banking anti-pattern with no atomicity.
 *   This route now forwards the raw transaction intent to the backend.
 *   All balance arithmetic, overdraft protection, currency checks, and race-condition
 *   guards happen atomically on the backend inside a SERIALIZABLE SQL transaction.
 *
 * Backend spec §9 — Credit body:   { accountNumber, amount, description? }
 * Backend spec §9 — Debit body:    { accountNumber, amount, description? }
 * Backend spec §9 — Transfer body: { sourceAccountNumber, destinationAccountNumber, amount, description? }
 *
 * On 200: { transaction: { id, type, amount, currency, balanceAfter, createdAt } }
 * On 400: INSUFFICIENT_FUNDS | CURRENCY_MISMATCH | SAME_ACCOUNT | VALIDATION_ERROR
 * On 403: ACCOUNT_FROZEN
 * On 404: ACCOUNT_NOT_FOUND
 */
export async function POST(request: Request) {
  try {
    const { method, data } = await request.json();

    let endpoint: string;

    if (method === "credit") {
      endpoint = "/transactions/credit";
    } else if (method === "debit") {
      endpoint = "/transactions/debit";
    } else if (method === "transfer") {
      endpoint = "/transactions/transfer";
    } else {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid transaction method." } },
        { status: 400 },
      );
    }

    const { data: transactionData } = await backendFetch<{
      transaction: {
        id: number;
        type: string;
        amount: number;
        currency: string;
        balanceAfter: number;
        createdAt: string;
      };
    }>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return NextResponse.json({ ok: true, data: transactionData });
  } catch (err) {
    const errorBody = apiErrorResponse(err);
    return NextResponse.json(
      { ok: false, message: errorBody.error.message, error: errorBody.error },
      { status: 400 },
    );
  }
}