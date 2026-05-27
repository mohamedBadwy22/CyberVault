import { NextResponse } from "next/server";
import { backendFetch, apiErrorResponse } from "@/src/lib/backendClient";

/**
 * POST /api/contactAPI
 * Proxies → POST /api/v1/contact
 *
 * Sends a contact message to the backend.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data } = await backendFetch<{ message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({ status: "success", message: data?.message || "Message sent successfully!" });
  } catch (err) {
    return NextResponse.json(
      { status: "failed", message: apiErrorResponse(err).error.message },
      { status: 400 },
    );
  }
}