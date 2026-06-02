// src/app/api/[...nextauth]/route.ts
// NextAuth App Router handler — mounts the NextAuth endpoints:
//   POST /api/auth/callback/credentials   (called by signIn())
//   GET  /api/auth/session                (called by useSession())
//   GET  /api/auth/signout                etc.
//
// Imports authOption from src/auth.ts.

import NextAuth from "next-auth";
import { authOption } from "@/src/auth";

const handler = NextAuth(authOption);

export { handler as GET, handler as POST };
