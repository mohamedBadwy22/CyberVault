import getMyToken from "@/src/utilities/getMyToken";
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export async function POST(request: Request) {
    const { currentPassword, newPassword } = await request.json();
    const token = await getMyToken();

    
    const {id} = jwtDecode(token) as any;
    
    const res = await fetch(`https://dummyjson.com/users/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    password: newPassword
  })
})
    const response = await res.json();
    response.message ?   response.ok = false : response.ok = true;    
    
    return NextResponse.json(response);
}