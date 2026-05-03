import getMyToken from "@/src/utilities/getMyToken";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function POST(request: Request) {
  const { method, data, accountInfo } = await request.json();
  const token = await getMyToken();
  const { id } = jwtDecode(token) as any;

  if (method === "transfer") {
    if (
      !data?.sourceAccountNumber ||
      !data?.destinationAccountNumber ||
      typeof data?.amount !== "number"
    ) {
      return NextResponse.json({ ok: false, message: "Invalid transfer data" });
    }

    if (data.sourceAccountNumber === data.destinationAccountNumber) {
      return NextResponse.json({
        ok: false,
        message: "Destination account must be different",
      });
    }

    const destinationAccountReq = await fetch(
      `https://69e803092f51b534be5fb1fc.mockapi.io/mock/user/AccountData?accountNumber=${encodeURIComponent(data.destinationAccountNumber)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    const destinationAccountPayload = await destinationAccountReq.json();
    const destinationAccount = Array.isArray(destinationAccountPayload)
      ? destinationAccountPayload[0]
      : null;

    if (!destinationAccount) {
      return NextResponse.json({
        ok: false,
        message: "Destination account not found",
      });
    }

    const sourceNextBalance = accountInfo.balance - data.amount;
    const destinationNextBalance = destinationAccount.balance + data.amount;

    const updateSourceReq = await fetch(
      `https://69e803092f51b534be5fb1fc.mockapi.io/mock/user/AccountData/${accountInfo.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: sourceNextBalance }),
      },
    );
    const updateSourcePayload = await updateSourceReq.json();

    if (updateSourcePayload === "Not found") {
      return NextResponse.json({ ok: false, message: "Account not found" });
    }

    const updateDestinationReq = await fetch(
      `https://69e803092f51b534be5fb1fc.mockapi.io/mock/user/AccountData/${destinationAccount.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: destinationNextBalance }),
      },
    );
    const updateDestinationPayload = await updateDestinationReq.json();

    if (updateDestinationPayload === "Not found") {
      return NextResponse.json({
        ok: false,
        message: "Destination account not found",
      });
    }

    return NextResponse.json({ ok: true, message: "Transaction successful" });
  }

  
  const nextBalance =
    method === "credit"
      ? accountInfo.balance + data.amount
      : accountInfo.balance - data.amount;

  const res = await fetch(
    `https://69e803092f51b534be5fb1fc.mockapi.io/mock/user/AccountData/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        balance: nextBalance,
      }),
    },
  );
  const response = await res.json();

  if (response === "Not found") {
    return NextResponse.json({ ok: false, message: "Account not found" });
  }
  return NextResponse.json({ ok: true, message: "Transaction successful" });
}