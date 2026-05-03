import getMyToken from "@/src/utilities/getMyToken";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

    let { page , filter} = await request.json();
    const token = await getMyToken();
    let ok = false;
    let finished = false;

    filter === 'employee' ? filter = 'moderator' : filter = filter;
    const req = await fetch(`https://dummyjson.com/users${filter !== "All" ? `/filter?key=role&value=${filter}&` : '?'}limit=10&skip=${(page - 1) * 10}`,{
        method:'GET'
    })
    const payload = await req.json();
    const data = payload.users.map((user: any) => ({
        name: user.firstName + " " + user.lastName,
        role: user.role === "moderator" ? "employee" : user.role,
        id: user.id,
        email: user.email,
        accountNumber: user.role !== "user" ? null : user.bank.iban,
    }));
    if(payload.message) {
        ok = false;
    } else {
        ok = true;
        if (payload.users.length === 0) {
            finished = true
            ok = false;
        }
    }
    return NextResponse.json({ data, ok, finished });
}