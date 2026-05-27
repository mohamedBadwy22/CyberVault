import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

/**
 * POST /api/deleteAPI
 * Proxies → 
 *   DELETE /api/v1/users/:id
 *   DELETE /api/v1/employees/:id
 *
 * Deletes a user or employee by their ID.
 */
export async function POST(request: Request) {
  try {
    const { whoWeDelete, id } = await request.json();

    const endpoint = whoWeDelete === "employee" ? `/employees/${id}` : `/users/${id}`;

    const { data } = await backendFetch(endpoint, {
      method: "DELETE",
    });

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: apiErrorResponse(err).error }, { status: 400 });
  }
}