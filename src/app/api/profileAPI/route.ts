// src/app/api/profileAPI/route.ts
// Proxies GET /api/v1/profile
//
// Backend spec §8.2 GET /profile response:
// {
//   data: {
//     id, bankUserId, name, email, phone, dateOfBirth, gender, role,
//     mustChangePassword,
//     department: { departmentName, departmentRegion, departmentRole, departmentSince, departmentStatus } | null,
//     account: { accountNumber, accountType, currency, balance, accountStatus },
//     createdAt
//   }
// }
//
// Notes:
//   - phone is decrypted before returning (spec §8.2)
//   - accountNumber is decrypted before returning
//   - department is null for role=user
//   - balance is a JS number (DECIMAL with decimalNumbers:true in Sequelize config)

import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

type ProfileData = {
  id: number;
  bankUserId: string;
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  role: "admin" | "employee" | "user";
  mustChangePassword: boolean;
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
    currency: "EGP" | "USD" | "EUR";
    balance: number;
    accountStatus: string;
  } | null;
  createdAt: string;
};

export async function GET() {
  try {
    const { data } = await backendFetch<ProfileData>("/profile");

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    const errResponse = apiErrorResponse(err);
    return NextResponse.json(
      { ok: false, error: errResponse.error },
      { status: 401 }
    );
  }
}
