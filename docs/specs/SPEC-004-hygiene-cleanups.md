# SPEC-004 — Code hygiene cleanups

**Priority:** P3 (no runtime impact — batch last)
**Status:** proposed
**Affected files:** `src/app/_components/Unlock/Unlock.tsx`,
`src/app/_components/PersonalData/PersonalData.tsx`, `src/auth.ts`

---

Small, independent cleanups. None change behavior. Do after SPEC-001 (some
overlap, noted below).

## 4.1 Dead `"use strict"` directive

`src/app/_components/Unlock/Unlock.tsx` line 1 is `"use strict";` directly above
`"use client";`. ES modules are always strict; the directive is dead and the
only thing that matters on line 1 of a client component is `"use client"`.
**Action:** delete line 1.

## 4.2 Untyped `PersonalData` props

`src/app/_components/PersonalData/PersonalData.tsx` line 5 destructures
`({ profileData, whoWeDelete }: any)`. A typed shape already exists.
**Action:** type props as `{ profileData: profileDataType | null; whoWeDelete?: string }`
(import `profileDataType` from `src/types/types.ts`). Pairs with SPEC-003 §4.2,
which adds `isLocked` to that type.

## 4.3 Brittle `Set-Cookie` parsing on login

`src/auth.ts` `authorize()` (~lines 29–48) reads the login `Set-Cookie` with
`getSetCookie()` **and** a fallback regex that splits a joined `set-cookie`
string on commas. The fallback is fragile (commas appear inside cookie `Expires`
dates). `res.headers.getSetCookie()` is supported in the Next.js server runtime
and returns a proper array.
**Action:** use `getSetCookie()` only; drop the regex fallback. Same approach is
needed in SPEC-001 §4.1 for the refresh response — share one small helper
`extractCookie(res, name)` if convenient.

## 4.4 Repeated JWT base64 decode — only if SPEC-001 not applied

`src/auth.ts` decodes the access-token payload by hand in up to three places.
**SPEC-001 §4.3 removes the proactive-refresh block, which eliminates two of
them**, leaving only the login decode. If SPEC-001 is applied, **skip this
item**. If the proactive refresh is kept for any reason, extract a
`decodeJwtPayload(token): { exp?: number; mustChangePassword?: boolean }` helper.

## 5. Acceptance criteria

- [ ] `Unlock.tsx` no longer contains `"use strict"`.
- [ ] `PersonalData` props are typed (no `any`).
- [ ] Login cookie extraction uses `getSetCookie()` only.
- [ ] No behavior change: login, unlock, and management views work as before.

## 6. Verification

`npm run build` / `tsc` passes with no new errors; smoke-test login + a
management search.
