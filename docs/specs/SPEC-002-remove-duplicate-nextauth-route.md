# SPEC-002 — Remove dead duplicate NextAuth route

**Priority:** P1 (correctness / hygiene — safe standalone delete)
**Status:** proposed
**Affected files:** `src/app/api/[...nextauth]/route.ts` (delete)

---

## 1. Problem

There are two NextAuth catch-all handlers:

- `src/app/api/auth/[...nextauth]/route.ts` — the **correct** mount. NextAuth's
  client (`signIn`, `useSession`, `getServerSession`) calls `/api/auth/*`.
- `src/app/api/[...nextauth]/route.ts` — a second catch-all one level up at
  `/api/`. NextAuth is never mounted there.

Both build `NextAuth(authOption)` from `src/auth.ts`. The `/api/`-level one is
dead: specific routes (`/api/loginAPI`, `/api/manageAPI`, …) and the more
specific `/api/auth/[...nextauth]` win routing, so it serves nothing — it only
shadows the `/api/` namespace and confuses readers about where auth lives.

## 2. Evidence

- `src/app/api/auth/[...nextauth]/route.ts` — the canonical handler; bare
  `NextAuth(authOption)`, imports `authOption` from `../../../../auth`.
- `src/app/api/[...nextauth]/route.ts` — the duplicate; also builds
  `NextAuth(authOption)`. Its own header comment claims it mounts
  `/api/auth/callback/credentials`, `/api/auth/session`, … — which is
  **misleading**: at the `/api/[...nextauth]` path it would serve `/api/*`, not
  `/api/auth/*`, so those endpoints come from the canonical file, not this one.

## 3. Design

Delete `src/app/api/[...nextauth]/route.ts`. No replacement.

## 4. Acceptance criteria

- [ ] `src/app/api/[...nextauth]/` no longer exists.
- [ ] `src/app/api/auth/[...nextauth]/route.ts` remains unchanged.
- [ ] Login, session fetch, and sign-out still work.

## 5. Verification

1. Delete the file, restart dev server.
2. Log in → succeeds (`/api/auth/callback/credentials`).
3. `useSession()` populates (`/api/auth/session`).
4. Sign out → succeeds.
