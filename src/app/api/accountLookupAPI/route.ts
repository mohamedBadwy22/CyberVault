// src/app/api/accountLookupAPI/route.ts
// Proxies GET /api/v1/accounts/lookup?accountNumber=...
//
// Backend spec §8.4 GET /accounts/lookup:
//   Query: accountNumber (string)
//   200:   { data: { id, accountNumber, currency, accountStatus,
//                    owner: { name, bankUserId } } }
//   404:   ACCOUNT_NOT_FOUND
//
// Used by TransferTransaction to verify the destination account before submitting.
// The `id` field is the account's integer PK — useful for future use.

import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse, ApiError } from "@/src/lib/backendClient";

type AccountLookupResult = {
  id: number;
  accountNumber: string;
  currency: "EGP" | "USD" | "EUR";
  accountStatus: string;
  owner: {
    name: string;
    bankUserId: string;
  };
};

export async function POST(request: Request) {
  try {
    const { accountNumber } = await request.json();

    if (!accountNumber || typeof accountNumber !== "string") {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "accountNumber is required." } },
        { status: 400 }
      );
    }

    const { data } = await backendFetch<AccountLookupResult>(
      `/accounts/lookup?accountNumber=${encodeURIComponent(accountNumber)}`
    );

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const errResponse = apiErrorResponse(err);
    const httpStatus = err instanceof ApiError ? err.httpStatus : 500;

    return NextResponse.json(
      { ok: false, error: errResponse.error },
      { status: httpStatus }
    );
  }
}
