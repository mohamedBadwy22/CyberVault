'use server';
import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

export default async function getRefreshToken() {
    const encodedRefreshToken = (await cookies()).get('next-auth.refresh-token')?.value;
    const decodedToken =decode({ secret: process.env.NEXTAUTH_SECRET!, token: encodedRefreshToken });
    return decodedToken;
}