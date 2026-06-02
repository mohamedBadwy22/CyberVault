// next-auth.d.ts
// Extends NextAuth's built-in types to include the custom fields used by this project.
// Matches the shapes defined in auth.ts and consumed throughout the app.

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // Custom fields from backend spec §7.2
      role: "admin" | "employee" | "user";
      bankUserId: string;
      mustChangePassword: boolean;
    };
    // RefreshAccessTokenError if refresh failed
    error?: string;
  }

  interface User {
    id: string;
    // Raw access token — stored in JWT callback only, never forwarded to session
    accessToken: string;
    mustChangePassword: boolean;
    expiresAt: number;
    user: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "employee" | "user";
      bankUserId: string;
      mustChangePassword: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    // Raw access token (server-side only, never sent to client)
    token: string;
    expiresAt: number;
    mustChangePassword: boolean;
    error?: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "employee" | "user";
      bankUserId: string;
      mustChangePassword: boolean;
    };
  }
}
