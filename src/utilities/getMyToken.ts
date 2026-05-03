'use server';
import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

export default async function getMyToken() {
    const encodedToken = (await cookies()).get("next-auth.session-token")?.value;
    const decodedToken = await decode({ secret: process.env.NEXTAUTH_SECRET!, token: encodedToken });
    const { token } = decodedToken as any;
    return token;
}