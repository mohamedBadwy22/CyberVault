import getMyToken from "@/src/utilities/getMyToken";
import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    const { searchParam } = await request.json();
    const token = await getMyToken();
    const {id} : {id: string} = jwtDecode(token);
    

    const res = await fetch(`https://69e803092f51b534be5fb1fc.mockapi.io/mock/user/AccountData/${searchParam === '' ? id : searchParam}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': `${token}`,
        },
    });
    const payload = await res.json();

    if (payload !== "Not found") {
        return NextResponse.json({ data: payload, ok: true });
    } 
    return NextResponse.json({ ok: false });
}