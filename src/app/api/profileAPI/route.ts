import getMyToken from "@/src/utilities/getMyToken";
import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const token = await getMyToken();
    const {id} : {id: string} = jwtDecode(token);
    

    const res = await fetch(`https://69e803092f51b534be5fb1fc.mockapi.io/mock/user/profileData/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': `${token}`,
        },
    });
    const profileData = await res.json();

    
    return NextResponse.json(profileData);
}