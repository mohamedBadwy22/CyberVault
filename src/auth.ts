import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import refreshAccessToken from "./utilities/getRefreshToken";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

export const authOption: NextAuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        bankUserId: {},
        password: {},
      },
      authorize: async (credentials) => {
        const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // `credentials: 'include'` forwards cookies — the backend will set
          // the refreshToken HttpOnly cookie via Set-Cookie in the response.
          credentials: "include",
          body: JSON.stringify({
            bankUserId: credentials?.bankUserId,
            password: credentials?.password,
          }),
        });

        const body = await res.json();

        // Backend wraps all responses in { success, data } or { success, error }.
        if (!body.success) {
          // Return null to let NextAuth show a generic error.
          // For lock-specific messaging, the LoginForm already handles it.
          return null;
        }

        const { accessToken, mustChangePassword, user } = body.data as {
          accessToken: string;
          mustChangePassword: boolean;
          user: {
            id: number;
            bankUserId: string;
            name: string;
            role: string;
            email: string;
          };
        };

        return {
          // NextAuth User shape — we store the raw access token here so the
          // JWT callback can pick it up. It is NEVER forwarded to the session.
          id: String(user.id),
          accessToken,
          mustChangePassword,
          user: {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
            bankUserId: user.bankUserId,
            mustChangePassword,
          },
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in
      if (user) {
        token.token = user.accessToken;
        token.mustChangePassword = user.mustChangePassword;
        token.user = user.user;
        
        try {
          const payload = JSON.parse(Buffer.from((user.accessToken as string).split('.')[1], 'base64').toString());
          token.expiresAt = payload.exp * 1000;
        } catch (e) {
          token.expiresAt = Date.now() + 10 * 60 * 1000; // fallback to 10 mins
        }
        return token;
      }
      
      // Subsequent requests: check if token is close to expiration (e.g. within 30 seconds)
      if (Date.now() > (token.expiresAt as number) - 30000) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          token.token = newToken;
          try {
            const payload = JSON.parse(Buffer.from(newToken.split('.')[1], 'base64').toString());
            token.expiresAt = payload.exp * 1000;
          } catch (e) {
            token.expiresAt = Date.now() + 10 * 60 * 1000;
          }
          token.error = undefined;
        } else {
          // If refresh fails, keep the old token but mark it so the client knows it's broken
          token.error = "RefreshAccessTokenError";
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Only the user profile (no access token) is forwarded to the client session.
      if (token.user) {
        session.user = { ...session.user, ...token.user };
      }
      return session;
    },
  },
};