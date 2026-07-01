import type { DefaultSession, DefaultUser } from "next-auth"
import type { JWT as DefaultJWT } from "next-auth/jwt"

interface AppUserProfile {
	id?: string
	name?: string | null
	email?: string | null
	role?: string
	bankUserId?: string
	mustChangePassword?: boolean
	[key: string]: unknown
}

declare module "next-auth" {
	interface User extends DefaultUser {
		id?: string
		/** Raw access token returned by the backend — stored in JWT only, never in session. */
		accessToken?: string
		refreshToken?: string
		user?: AppUserProfile
		mustChangePassword?: boolean
	}

	interface Session {
		/** Public user profile. accessToken is intentionally excluded to prevent client exposure. */
		user: AppUserProfile & DefaultSession["user"]
	}
}

declare module "next-auth/jwt" {
	interface JWT extends DefaultJWT {
		/** Raw access + refresh tokens — server-side only. Never forward these to the session object. */
		token?: string
		refreshToken?: string
		user?: AppUserProfile
		mustChangePassword?: boolean
		expiresAt?: number
		error?: string
	}
}

export {}

