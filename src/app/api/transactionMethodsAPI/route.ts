// src/app/api/transactionMethodsAPI/route.ts
// Proxies POST /api/v1/transactions/credit, /debit, /transfer
//
// Backend spec §8.4 request/response shapes:
//
// Credit:
//   Body:  { accountNumber: string, amount: number, description?: string }
//   200:   { data: { transaction: { id, type, amount, currency, balanceAfter, createdAt } } }
//   400:   VALIDATION_ERROR | INSUFFICIENT_FUNDS
//   403:   ACCOUNT_FROZEN
//   404:   ACCOUNT_NOT_FOUND
//
// Debit:
//   Body:  { accountNumber: string, amount: number, description?: string }
//   200:   { data: { transaction: { id, type, amount, currency, balanceAfter, createdAt } } }
//   400:   INSUFFICIENT_FUNDS | VALIDATION_ERROR
//   403:   ACCOUNT_FROZEN
//   404:   ACCOUNT_NOT_FOUND
//
// Transfer:
//   Body:  { sourceAccountNumber, destinationAccountNumber, amount, description? }
//   200:   { data: { transaction: { id, type, amount, currency, balanceAfter, createdAt } } }
//   400:   INSUFFICIENT_FUNDS | CURRENCY_MISMATCH | SAME_ACCOUNT | VALIDATION_ERROR
//   403:   ACCOUNT_FROZEN
//   404:   ACCOUNT_NOT_FOUND

import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse, ApiError } from "@/src/lib/backendClient";

type TransactionResult = {
  id: number;
  type: "credit" | "debit" | "transfer";
  amount: number;
  currency: "EGP" | "USD" | "EUR";
  balanceAfter: number;
  createdAt: string;
};

// Human-readable error messages for each backend error code
const ERROR_MESSAGES: Record<string, string> = {
  INSUFFICIENT_FUNDS: "Insufficient funds in the account.",
  ACCOUNT_FROZEN: "This account is currently frozen.",
  ACCOUNT_NOT_FOUND: "Account not found.",
  CURRENCY_MISMATCH: "Transfer is only allowed between accounts of the same currency.",
  SAME_ACCOUNT: "Source and destination accounts must be different.",
  VALIDATION_ERROR: "Invalid transaction data. Please check the inputs.",
  ACCOUNT_NOT_OWNED: "You can only perform this operation on your own account.",
  MUST_CHANGE_PASSWORD: "You must change your password before performing transactions.",
  FORBIDDEN: "You do not have permission to perform this action.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { method, data } = body as {
      method: "credit" | "debit" | "transfer";
      data: Record<string, unknown>;
    };

    if (!["credit", "debit", "transfer"].includes(method)) {
      return NextResponse.json(
        { ok: false, message: "Invalid transaction method." },
        { status: 400 }
      );
    }

    // Build the correct backend request body per spec §8.4
    let backendBody: Record<string, unknown>;
    if (method === "transfer") {
      backendBody = {
        sourceAccountNumber: data.sourceAccountNumber,
        destinationAccountNumber: data.destinationAccountNumber,
        amount: data.amount,
        ...(data.description ? { description: data.description } : {}),
      };
    } else {
      // credit or debit
      backendBody = {
        accountNumber: data.accountNumber,
        amount: data.amount,
        ...(data.description ? { description: data.description } : {}),
      };
    }

    const { data: result } = await backendFetch<{ transaction: TransactionResult }>(
      `/transactions/${method}`,
      {
        method: "POST",
        body: JSON.stringify(backendBody),
      }
    );

    return NextResponse.json({ ok: true, transaction: result.transaction });
  } catch (err) {
    const errResponse = apiErrorResponse(err);
    const code = errResponse.error.code;
    const message = ERROR_MESSAGES[code] ?? errResponse.error.message;

    const httpStatus =
      err instanceof ApiError ? err.httpStatus : 500;

    return NextResponse.json(
      { ok: false, message, error: errResponse.error },
      { status: httpStatus }
    );
  }
}
