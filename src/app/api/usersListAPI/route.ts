// src/app/api/usersListAPI/route.ts
// Proxies GET /api/v1/users with pagination and filters
//
// Backend spec §8.3 GET /users:
//   Query: page (default 1), limit (default 10, max 100),
//          name, email, bankUserId, role
//   200:   {
//     data: [{ id, bankUserId, name, email, role, isActive, mustChangePassword, createdAt }],
//     pagination: { page, limit, total, pages }
//   }
//   Auth:  admin | employee

import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

type UserListItem = {
  id: number;
  bankUserId: string;
  name: string;
  email: string;
  role: "admin" | "employee" | "user";
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
};

export async function POST(request: Request) {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      email,
      bankUserId,
      role,
    } = await request.json();

    const params = new URLSearchParams({
      page: String(page),
      limit: String(Math.min(limit, 100)),
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(bankUserId ? { bankUserId } : {}),
      ...(role && role !== "All" ? { role } : {}),
    });

    const { data, pagination } = await backendFetch<UserListItem[]>(
      `/users?${params.toString()}`
    );

    if (!data || data.length === 0) {
      return NextResponse.json({ ok: false, finished: true, data: [] });
    }

    const isLastPage = pagination ? page >= pagination.pages : data.length < limit;

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
