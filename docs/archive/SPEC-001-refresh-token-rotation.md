# SPEC-001 — Refresh-token rotation persistence & single refresh path

**Priority:** P0 (critical — this is the reported `access token expired` bug)
**Status:** ✅ completed (2026-07-02)
**Affected files:** `src/utilities/getRefreshToken.ts`, `src/lib/backendClient.ts`,
`src/utilities/getMyToken.ts`, `src/auth.ts`, `src/utilities/sessionToken.ts`

---

## 1. Problem

After a single access-token expiry the user is forced back to login with an
`access token expired` / refresh failure, even though the refresh token is valid
for 30 days and should silently rotate the access token in the background.

## 2. Root cause (evidence)

The backend **rotates** refresh tokens. Per `BACKEND_SPEC.md` §7.3:

- step 7: each `POST /api/v1/auth/refresh` revokes the old refresh token and
  issues a new one as a fresh `Set-Cookie: refreshToken=...`.
- step 6: presenting an already-revoked refresh token →
  `RefreshTokenRepository.revokeFamilyByUserId(...)` → `TOKEN_REUSE_DETECTED`
  (the whole family is revoked).

`refreshAccessToken()` in `src/utilities/getRefreshToken.ts` reads the new
**access** token from the response body but **discards the rotated `refreshToken`
`Set-Cookie`**. The stored cookie therefore stays pinned to the now-revoked
token. Sequence:

```
login          → refreshToken v1 stored (httpOnly)
access expires → /auth/refresh → backend revokes v1, returns v2 in Set-Cookie
                 code IGNORES v2, keeps v1            (this refresh still succeeds)
access expires → /auth/refresh with v1 (revoked) → TOKEN_REUSE_DETECTED
                 → family revoked → all future refresh fails → "access token expired"
```

The session dies after **exactly one** rotation, matching the report.

### Amplifier A — fresh access token never persisted
In `backendFetch` (`src/lib/backendClient.ts`, transparent-refresh block ~lines
98–138) the new access token is used for the retry only; it is never written
back. `getMyToken()` decodes `token.token` straight from the session cookie, so
it keeps returning the **expired** access token. Result: *every* subsequent
request 401s → *every* request triggers another rotation → the family is burned
through immediately.

### Amplifier B — two uncoordinated refresh paths
1. `src/auth.ts` jwt callback (~lines 127–161) refreshes proactively and updates
   `token.token`, but a jwt callback has no response context to persist the
   rotated **refresh** cookie.
2. `src/lib/backendClient.ts` (~line 105) refreshes reactively and persists
   neither.

Two independent rotators against a reuse-detecting backend guarantee family
revocation under any real traffic.

## 3. Non-goals (already correct — do not change)

Refresh-token **confidentiality** is sound and must stay that way:

- backend sets `refreshToken` as `HttpOnly; Secure; SameSite=Strict`
  (`BACKEND_SPEC.md` §7.1, line ~550).
- `src/auth.ts` `authorize()` re-sets it `httpOnly` on the Next.js domain →
  frontend JS cannot read it.
- the access token lives in `token.token` inside the encrypted NextAuth session
  JWT; `session()` omits it, so it never reaches `useSession()`.
- `getMyToken` / `refreshAccessToken` are `'use server'` (server-only).

This spec fixes **persistence**, not a leak.

## 4. Design

All `backendFetch` callers are route handlers (`src/app/api/*/route.ts`) or
`'use server'` actions (`src/app/change-password/actions.ts`) — verified — so
`cookies().set()` is legal in every refresh context. Use **one reactive refresh
path** that persists both tokens.

### 4.1 `refreshAccessToken()` — persist the rotated refresh cookie
After `POST /auth/refresh` succeeds:
1. Read the rotated refresh token from `res.headers.getSetCookie()` (match the
   `refreshToken=` entry).
2. Persist it via `cookies().set("refreshToken", value, { httpOnly: true,
   secure: NODE_ENV === "production", sameSite: "strict", path: "/", maxAge:
   30*24*60*60 })` — same options the login path in `auth.ts` already uses.
3. Return the new access token (unchanged).

### 4.2 Cache the fresh access token (kills Amplifier A + the concurrency race)
After a successful refresh, `backendFetch` writes the new access token to a
dedicated short-lived cookie:
`cookies().set("accessToken", newToken, { httpOnly: true, secure: …,
sameSite: "strict", path: "/", maxAge: 600 })` (10 min — access-token TTL per
§7.1).

`getMyToken()` reads `accessToken` cookie **first**, falling back to the session
JWT `token.token` (the login seed) when the cookie is absent. This stops the
per-request re-refresh loop.

### 4.3 Collapse to one path
Remove the proactive refresh block from `src/auth.ts` jwt callback (~lines
127–161). Keep:
- the initial sign-in branch that seeds `token.token`, and
- the `trigger === "update"` branch that clears `mustChangePassword`.

`mustChangePassword` no longer needs refresh-time syncing — the change-password
flow already updates it via the `update` trigger.

## 5. Known limitation (accepted)

Two requests hitting the exact expiry boundary can both refresh with the same
refresh token → one rotation revokes the other → `TOKEN_REUSE_DETECTED`. Low
frequency (only at the 10-min boundary with ≥2 concurrent calls).
`ponytail:` accepted for an internal admin tool; upgrade path = single-flight
refresh lock (one in-flight `/auth/refresh` per process) or a backend grace
window that tolerates the immediately-prior token for a few seconds.

## 6. Acceptance criteria

- [ ] After the access token expires, an API call refreshes **and the next call
      reuses the cached access token without re-hitting `/auth/refresh`**.
- [ ] Two consecutive expiries succeed (no `TOKEN_REUSE_DETECTED`); the stored
      `refreshToken` cookie value changes after each refresh.
- [ ] Only one code path calls `refreshAccessToken()` (grep returns
      `backendClient.ts` only; `auth.ts` no longer imports it).
- [ ] `useSession()` / network tab never exposes the access or refresh token to
      the browser (confidentiality unchanged).
- [ ] `mustChangePassword` redirect still works after the change-password flow.

## 7. Verification

1. Set backend access-token TTL low (or wait 10 min). Log in, idle past expiry,
   perform an action (e.g. open Manage → search). Expect success, no redirect to
   `/login`.
2. Repeat the idle-then-act cycle a second time. Expect success (proves rotation
   persisted).
3. Inspect the `refreshToken` cookie value before/after a refresh — it must
   change.
4. DevTools → Application → Cookies: confirm `refreshToken` and `accessToken`
   are `HttpOnly` and absent from JS (`document.cookie` shows neither).
5. `grep -rn "refreshAccessToken" src` → import only in `backendClient.ts`.

## 8. Resolution (as implemented — 2026-07-02)

The persistence design differs from §4.1/§4.2: instead of separate plaintext
`refreshToken` / `accessToken` cookies, **both tokens live inside the single
encrypted NextAuth session JWT** (`src/utilities/sessionToken.ts`
`readSessionToken`/`writeSessionToken`). `refreshAccessToken()` rotates the
access token and the revoked-and-reissued refresh token in place and re-encrypts
the whole cookie. This keeps the browser from ever holding a decodable token
(stronger than §4.2) while still persisting rotation. §4.3 done — `auth.ts` no
longer refreshes; `backendClient.ts` is the only path.

### 8.1 Residual concurrency bug (§5) — fixed
The "accepted limitation" in §5 was **not** benign in practice. React StrictMode
double-fires effects in dev, so a page load after expiry fired two concurrent
`backendFetch` calls, **both carrying the same pre-rotation refresh cookie**
(each request has its own cookie snapshot, so neither can see the other's
rotated token). The single-flight lock only deduped *temporally overlapping*
refreshes — it evicted on resolve — so the second call fired its own
`/auth/refresh` with the already-revoked token → `TOKEN_REUSE_DETECTED` → the
whole family was burned after one expiry.

**Fix (`src/utilities/getRefreshToken.ts`):** the single-flight lock now keeps
each resolved refresh cached for a 15s grace window (`REFRESH_GRACE_MS`) instead
of deleting on resolve. A late duplicate holding the same token reuses the
already-rotated access token instead of re-refreshing a revoked one. Root-cause
fix in the shared function → protects every `backendFetch` caller, not just the
dashboard. Multi-instance deploys still need a backend grace window (noted in
`doRefresh`).
