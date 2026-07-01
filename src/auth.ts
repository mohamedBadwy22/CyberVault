import { cookies } from "next/headers";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Backend spec §4: BACKEND_URL already includes /api/v1
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:5000/api/v1").replace(/\/+$/, "");

export const authOption: NextAuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        bankUserId: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const res = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bankUserId: credentials?.bankUserId,
              password: credentials?.password,
            }),
          });

          // Extract the refreshToken cookie from the backend response and re-set
          // it (httpOnly) on the Next.js domain so the browser never sees it.
          const cookiesArray = res.headers.getSetCookie?.() ?? [];
          for (const cookieStr of cookiesArray) {
            const match = cookieStr.match(/^refreshToken=([^;]+)/);
            if (match) {
              const cookieStore = await cookies();
              cookieStore.set("refreshToken", match[1], {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 30 * 24 * 60 * 60, // 30 days
              });
              break;
            }
          }

          // Backend spec §8.1: login response envelope is { success, data } or { success, error }
          const body = await res.json();

          if (!body.success) {
            // Propagate the backend error code so LoginForm can handle specific cases
            // (INVALID_CREDENTIALS, ACCOUNT_LOCKED, ACCOUNT_INACTIVE)
            return null;
          }

          // Backend spec §7.2 success response shape:
          // { accessToken, mustChangePassword, user: { id, bankUserId, name, role, email } }
          const { accessToken, mustChangePassword, user } = body.data as {
            accessToken: string;
            mustChangePassword: boolean;
            user: {
              id: number;
              bankUserId: string;
              name: string;
              role: "admin" | "employee" | "user";
              email: string;
            };
          };

          // Decode the JWT to get the expiry (access token is 10 min per spec §7.1)
          let expiresAt = Date.now() + 10 * 60 * 1000; // fallback
          try {
            const payload = JSON.parse(
              Buffer.from(accessToken.split(".")[1], "base64").toString()
            );
            expiresAt = payload.exp * 1000;
          } catch {
            // Use fallback expiry
          }

          // Overwrite any stale accessToken cache left by a previous user/session.
          // getMyToken() reads this cookie first, so without overwriting it here a
          // new login would keep using the previous user's token (cross-user bleed).
          try {
            const cookieStore = await cookies();
            cookieStore.set("accessToken", accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              path: "/",
              maxAge: 600, // 10 minutes (access-token TTL, spec §7.1)
            });
          } catch {
            // non-fatal
          }

          return {
            // NextAuth User shape — accessToken stored here for JWT callback only
            id: String(user.id),
            accessToken,
            mustChangePassword,
            expiresAt,
            user: {
              id: String(user.id),
              name: user.name,
              email: user.email,
              // backend spec §7.6: role is 'admin' | 'employee' | 'user'
              role: user.role,
              bankUserId: user.bankUserId,
              mustChangePassword,
            },
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.mustChangePassword === false) {
        token.mustChangePassword = false;
        if (token.user) {
          (token.user as any).mustChangePassword = false;
        }
      }

      // Initial sign-in: store everything from authorize() in the JWT token.
      // token.token is the access-token seed; getMyToken() reads it as a
      // fallback until refreshAccessToken() caches a rotated one.
      if (user) {
        token.token = user.accessToken;
        token.mustChangePassword = user.mustChangePassword;
        token.expiresAt = user.expiresAt;
        token.user = user.user;
        return token;
      }

      // No refresh here: token rotation lives in a single place
      // (backendFetch -> refreshAccessToken) where the rotated refresh cookie
      // can actually be persisted. A jwt callback cannot set that cookie, so a
      // refresh here would silently desync and trip TOKEN_REUSE_DETECTED.
      return token;
    },

    async session({ session, token }) {
      // Only the user profile (no raw access token) is forwarded to the client session
      if (token.user) {
        session.user = { ...session.user, ...(token.user as object) };
      }
      // Expose the error flag so client components can react to broken sessions
      if (token.error) {
        (session as any).error = token.error;
      }
      return session;
    },
  },
};
