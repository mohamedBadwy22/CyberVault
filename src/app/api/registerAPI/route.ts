import getMyToken from "@/src/utilities/getMyToken";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    const { data, whoWeAdd } = await request.json();
    const token = await getMyToken();

    

    const res = await fetch(`https://dummyjson.com/c/ed24-367f-4f41-b57b`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'token': `${token}`,
        },
        body: JSON.stringify({ data })
    });
    const response = await res.json();

    return NextResponse.json(response);
}

// {
//   "name": "Mohamed",
//   "email": "m@gmail.com",
//   "phone": "01012345678",
//   "gender": "male",
//   "account": {
//     "accountType": "saving",
//     "currency": "EGP"
//   }
// }