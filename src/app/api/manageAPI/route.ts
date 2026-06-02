// src/app/api/manageAPI/route.ts
// Proxies GET /api/v1/users/:id to fetch a single user with their account/department data.
//
// Backend spec §8.3 GET /users/:id response:
// {
//   data: {
//     id, bankUserId, name, email, phone, dateOfBirth, gender, role, isActive,
//     department: { departmentName, departmentRegion, departmentRole, departmentSince, departmentStatus } | null,
//     account: { accountNumber, accountType, currency, balance, accountStatus },
//     createdAt
//   }
// }
//
// The `whoWeSearch` param is 'user' | 'employee'.
// `searchParam` is the bankUserId (8-digit string) to look up.
// We first call GET /users?bankUserId=... to get the DB id, then GET /users/:id.

import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

type UserListItem = {
  id: string;
  bankUserId: string;
  name: string;
  email: string;
  role: "admin" | "employee" | "user";
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
};

type UserDetail = {
  id: string;
  bankUserId: string;
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  role: "admin" | "employee" | "user";
  isActive: boolean;
  department: {
    departmentName: string;
    departmentRegion: string | null;
    departmentRole: "admin" | "employee";
    departmentSince: string;
    departmentStatus: "active" | "inactive";
  } | null;
  account: {
    accountNumber: string;
    accountType: string;
    currency: string;
    balance: number;
    accountStatus: string;
  } | null;
  createdAt: string;
};

export async function POST(request: Request) {
  try {
    const { searchParam, whoWeSearch } = await request.json();

    if (!searchParam || typeof searchParam !== "string") {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "Search parameter is required." } },
        { status: 400 }
      );
    }

    // Step 1: Search by bankUserId to get the DB integer id
    const params = new URLSearchParams({
      bankUserId: searchParam.trim(),
      limit: "1",
      page: "1",
    });

    const { data: users } = await backendFetch<UserListItem[]>(
      `/users?${params.toString()}`
    );

    if (!users || users.length === 0) {
      return NextResponse.json({ ok: false, error: { code: "USER_NOT_FOUND", message: "User not found." } });
    }

    // Step 2: Validate role matches what we're searching for
    const found = users[0];
    const isEmployee = found.role === "admin" || found.role === "employee";
    const isUser = found.role === "user";

    if (whoWeSearch === "employee" && !isEmployee) {
      return NextResponse.json({ ok: false, error: { code: "USER_NOT_FOUND", message: "Employee not found." } });
    }
    if (whoWeSearch === "user" && !isUser) {
      return NextResponse.json({ ok: false, error: { code: "USER_NOT_FOUND", message: "User not found." } });
    }

    // Step 3: Fetch full user details by DB id (decrypted phone + accountNumber)
    const { data: userDetail } = await backendFetch<UserDetail>(
      `/users/${found.id}`
    );

    // Shape the response for Management.tsx:
    // profileData → { id, bankUserId, name, email, dateOfBirth, gender, phone }
    // secondaryData → accountDataType (for user) or departmentDataType (for employee)
    const profileData = {
      id: String(userDetail.id),
      bankUserId: userDetail.bankUserId,
      name: userDetail.name,
      email: userDetail.email,
      dateOfBirth: userDetail.dateOfBirth ?? "",
      gender: userDetail.gender ?? "",
      phone: userDetail.phone ?? "",
    };

    let secondaryData: object | null = null;

    if (whoWeSearch === "user" && userDetail.account) {
      secondaryData = {
        accountNumber: userDetail.account.accountNumber,
        accountType: userDetail.account.accountType,
        currency: userDetail.account.currency,
        balance: userDetail.account.balance,
        accountStatus: userDetail.account.accountStatus,
        id: String(userDetail.id),
      };
    } else if (whoWeSearch === "employee" && userDetail.department) {
      secondaryData = {
        departmentName: userDetail.department.departmentName,
        departmentRegion: userDetail.department.departmentRegion ?? "",
        departmentRole: userDetail.department.departmentRole,
        departmentSince: userDetail.department.departmentSince,
        departmentStatus: userDetail.department.departmentStatus,
      };
    }

    return NextResponse.json({
      ok: true,
      data: { profileData, secondaryData },
    });
  } catch (err) {
    const errResponse = apiErrorResponse(err);
    return NextResponse.json(
      { ok: false, error: errResponse.error },
      { status: 404 }
    );
  }
}
