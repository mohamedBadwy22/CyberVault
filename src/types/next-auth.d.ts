import type { DefaultSession, DefaultUser } from "next-auth"
import type { JWT as DefaultJWT } from "next-auth/jwt"

interface AppUserProfile {
	id?: string
	name?: string | null
	email?: string | null
	role?: string
	[key: string]: unknown
}

declare module "next-auth" {
	interface User extends DefaultUser {
		id?: string
		accessToken?: string
		refreshToken?: string
		user?: AppUserProfile
	}

	interface Session {
		user: AppUserProfile & DefaultSession["user"]
		accessToken?: string
	}
}

declare module "next-auth/jwt" {
	interface JWT extends DefaultJWT {
		accessToken?: string
		user?: AppUserProfile
	}
}

export {}
