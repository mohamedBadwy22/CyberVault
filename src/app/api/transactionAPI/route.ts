import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

/**
 * POST /api/transactionAPI
 * Proxies → GET /api/v1/accounts/lookup?accountNumber=<searchParam>
 *
 * Backend spec §8.4:
 *   - Hashes the accountNumber query param with HMAC-SHA256 internally
 *   - Returns: { id, accountNumber (decrypted), currency, accountStatus, owner: { name, bankUserId } }
 *
 * When searchParam is empty, falls back to fetching the current user's own profile account.
 */
export async function POST(request: Request) {
  try {
    const { searchParam } = await request.json();

    if (searchParam === "" || searchParam == null) {
      // No search param — return the authenticated user's own account via GET /profile
      const { data } = await backendFetch<{
        account: {
          accountNumber: string;
          accountType: string;
          currency: string;
          balance: number;
          accountStatus: string;
        };
      }>("/profile");

      if (!data.account) {
        return NextResponse.json({ ok: false });
      }
      return NextResponse.json({ data: [data.account], ok: true });
    }

    // Look up a specific account by account number
    const { data } = await backendFetch<{
      id: number;
      accountNumber: string;
      currency: string;
      accountStatus: string;
      owner: { name: string; bankUserId: string };
    }>(`/accounts/lookup?accountNumber=${encodeURIComponent(searchParam)}`);

    return NextResponse.json({ data: [data], ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: apiErrorResponse(err).error });
  }
}