import getMyToken from "@/src/utilities/getMyToken";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    const { searchParam, whoWeSearch } = await request.json();
    const token = await getMyToken();
    

    const res = await fetch(`https://69e803092f51b534be5fb1fc.mockapi.io/mock/user/profileData/${searchParam}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': `${token}`,
        },
    });
    const profileData = await res.json();

    if (profileData !== 'Not found') {
        let secondaryData = null;

    if (whoWeSearch === 'user') {
        const res = await fetch(`https://69e803092f51b534be5fb1fc.mockapi.io/mock/user/AccountData/${searchParam}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': `${token}`,
        },
    });
    secondaryData = await res.json();
    } else if (whoWeSearch === 'employee') {
        const res = await fetch(`https://69e803092f51b534be5fb1fc.mockapi.io/mock/user/DepartmentData/${searchParam}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': `${token}`,
        },
    });
    secondaryData = await res.json();
    }
        return NextResponse.json({ data : { secondaryData, profileData } ,ok: true });
    }
    return NextResponse.json({ ok: false });
}