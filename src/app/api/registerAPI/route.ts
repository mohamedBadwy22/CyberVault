import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

/**
 * POST /api/registerAPI
 * Proxies →
 *   POST /api/v1/users     (when whoWeAdd === 'user')
 *   POST /api/v1/employees (when whoWeAdd === 'employee')
 *
 * Backend spec §8.3:
 *   - User body:     { name, email, phone, dateOfBirth, gender, nationalId?, account: { accountType, currency, balance } }
 *   - Employee body: { name, email, phone, dateOfBirth, gender, nationalId?, department: { departmentName, departmentRegion, departmentRole } }
 *
 * On 201: returns { user, account?, department?, temporaryPassword }
 * On 409: EMAIL_EXISTS | NATIONAL_ID_EXISTS
 */
export async function POST(request: Request) {
  try {
    const { data, whoWeAdd } = await request.json();

    const endpoint = whoWeAdd === "employee" ? "/employees" : "/users";

    const { data: responseData } = await backendFetch<{
      user: { id: number; bankUserId: string; name: string; role: string; email: string };
      account?: { accountNumber: string; accountType: string; accountStatus: string; currency: string; balance: number };
      department?: Record<string, string>;
      temporaryPassword: string;
    }>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return NextResponse.json({ success: true, data: responseData }, { status: 201 });
  } catch (err) {
    return NextResponse.json(apiErrorResponse(err), { status: 400 });
  }
}