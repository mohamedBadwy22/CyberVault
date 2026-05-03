import getMyToken from "@/src/utilities/getMyToken";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    const { whoWeDelete, id } = await request.json();
    const token = await getMyToken();
    let accountData = null;

    if (whoWeDelete === 'user') {
        const res = await fetch(`https://69e803092f51b534be5fb1fc.mockapi.io/mock/user/AccountData/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'token': `${token}`,
        },
    });
    accountData = await res.json();
    }

    const res = await fetch(`https://69e803092f51b534be5fb1fc.mockapi.io/mock/user/profileData/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'token': `${token}`,
        },
    });
    const data = await res.json();
    

    if (data !== 'Not found') {
        return NextResponse.json({ ok: true , data: { accountData, profileData: data } });
    }
    return NextResponse.json({ ok: false });
}