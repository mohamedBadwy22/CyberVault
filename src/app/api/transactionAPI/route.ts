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
      return NextResponse.json({ data: data.account, ok: true });
    }

    // Look up user by bankUserId to securely retrieve account info and balance
    const params = new URLSearchParams({
      bankUserId: searchParam.trim(),
      limit: "1",
      page: "1",
    });
    const { data: users } = await backendFetch<{ id: number; bankUserId: string }[]>(
      `/users?${params.toString()}`
    );

    if (!users || users.length === 0) {
      return NextResponse.json({ ok: false, error: { code: "USER_NOT_FOUND", message: "User not found." } });
    }

    const { data: userDetail } = await backendFetch<{
      account: {
        accountNumber: string;
        accountType: string;
        currency: string;
        balance: number;
        accountStatus: string;
      } | null;
    }>(`/users/${users[0].id}`);

    if (!userDetail.account) {
      return NextResponse.json({ ok: false, error: { code: "ACCOUNT_NOT_FOUND", message: "User does not have an account." } });
    }

    return NextResponse.json({ data: userDetail.account, ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: apiErrorResponse(err).error });
  }
}