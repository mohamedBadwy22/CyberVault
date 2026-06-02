// src/app/api/registerUserAPI/route.ts
// Proxies POST /api/v1/users (create user) and POST /api/v1/employees (create employee)
//
// Backend spec §8.3 POST /users:
//   Body: { name, email, phone, dateOfBirth (YYYY-MM-DD), gender ('male'|'female'),
//           nationalId?, account: { accountType, currency, balance } }
//   201: { data: { user: { id, bankUserId, name, role, email },
//                  account: { accountNumber, accountType, accountStatus, currency, balance },
//                  temporaryPassword } }
//   400: VALIDATION_ERROR
//   409: EMAIL_EXISTS | NATIONAL_ID_EXISTS
//
// Backend spec §8.3 POST /employees:
//   Body: { name, email, phone, dateOfBirth, gender, nationalId?,
//           department: { departmentName, departmentRegion, departmentRole ('admin'|'employee') } }
//   201: { data: { user: { id, bankUserId, role: 'employee', name, email },
//                  department: { departmentName, departmentRegion, departmentRole, departmentSince, departmentStatus },
//                  temporaryPassword } }
//   400: VALIDATION_ERROR
//   409: EMAIL_EXISTS | NATIONAL_ID_EXISTS
//
// IMPORTANT: temporaryPassword = 'Bank@<bankUserId>' (e.g. 'Bank@30000001')
//            It is returned once in the response and must be shown to the admin/employee.

import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse, ApiError } from "@/src/lib/backendClient";

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_EXISTS: "A user with this email address already exists.",
  NATIONAL_ID_EXISTS: "A user with this national ID already exists.",
  VALIDATION_ERROR: "Please check all required fields and try again.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { whoWeAdd: type, data: formData } = body as {
      whoWeAdd: "user" | "employee";
      data: any;
    };

    const endpoint = type === "employee" ? "/employees" : "/users";

    // Build the correct backend request body
    let backendBody: Record<string, unknown>;

    if (type === "employee") {
      // spec §8.3 POST /employees body shape
      backendBody = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        ...(formData.nationalId ? { nationalId: formData.nationalId } : {}),
        department: {
          departmentName: formData.department?.departmentName || formData.departmentName,
          departmentRegion: formData.department?.departmentRegion || formData.region || formData.departmentRegion,
          departmentRole: formData.department?.departmentRole || formData.role || formData.departmentRole,
        },
      };
    } else {
      // spec §8.3 POST /users body shape
      backendBody = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        ...(formData.nationalId ? { nationalId: formData.nationalId } : {}),
        account: {
          accountType: formData.account?.accountType || formData.accountType,
          currency: formData.account?.currency || formData.currency,
          balance: formData.account?.balance || formData.balance,
        },
      };
    }

    const { data } = await backendFetch<{
      user: { id: number; bankUserId: string; name: string; role: string; email: string };
      account?: {
        accountNumber: string;
        accountType: string;
        accountStatus: string;
        currency: string;
        balance: number;
      };
      department?: {
        departmentName: string;
        departmentRegion: string;
        departmentRole: string;
        departmentSince: string;
        departmentStatus: string;
      };
      temporaryPassword: string;
    }>(endpoint, {
      method: "POST",
      body: JSON.stringify(backendBody),
    });

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (err) {
    const errResponse = apiErrorResponse(err);
    const code = errResponse.error.code;
    const message = ERROR_MESSAGES[code] ?? errResponse.error.message;
    const httpStatus = err instanceof ApiError ? err.httpStatus : 500;

    return NextResponse.json(
      {
        ok: false,
        message,
        error: errResponse.error,
      },
      { status: httpStatus }
    );
  }
}
