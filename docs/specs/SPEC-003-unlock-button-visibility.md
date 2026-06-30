# SPEC-003 — Gate "Unlock" button on real lock state

**Priority:** P2 (feature correctness — backend-dependent)
**Status:** proposed (blocked on backend field)
**Affected files:** `BACKEND_SPEC.md` + backend (add field), `src/types/types.ts`,
`src/app/_components/PersonalData/PersonalData.tsx`,
`src/app/_components/Unlock/Unlock.tsx` (no logic change)

---

## 1. Problem

The "Unlock" button shows on every managed user, including accounts whose
**Account Status** is "Active". This looks wrong but is two different concepts
being conflated by the UI.

## 2. Background — two independent axes

| Concept | Field | Set by | Cleared by |
|--------|-------|--------|-----------|
| **Account Status** (shown in UI: Active / Inactive / Frozen) | `account.accountStatus` (`BACKEND_SPEC.md` §6, line ~410) | account lifecycle / admin | account edit |
| **Login lockout** (what Unlock fixes) | `lockoutUntil`, `failedLoginAttempts` (§6, lines ~383–384) | **5 failed logins → locked 15 min** (§7.5, lines ~615–620) | `PATCH /api/v1/users/:id/unlock` → sets `failedLoginAttempts = 0`, `lockoutUntil = NULL` (§7.5 line ~620) |

"Active" describes the bank-account lifecycle; "locked" is a transient
login-security state. An Active account becomes *locked* after 5 bad passwords.
They are orthogonal, so Active ≠ unlocked.

## 3. Root cause of the always-visible button

- `src/app/_components/PersonalData/PersonalData.tsx` renders `<Unlock>`
  unconditionally whenever `whoWeDelete` is truthy (the management view).
- It **cannot** gate on lock state because the backend never sends one:
  `GET /users/:id` returns `isActive` and `account.accountStatus`, but **not**
  `lockoutUntil` / `failedLoginAttempts` (`BACKEND_SPEC.md` §8, lines ~777–781).

Unlocking an already-unlocked user is a harmless no-op (sets attempts=0,
lockoutUntil=NULL), so today's behavior is safe but noisy.

## 4. Design

Backend-first; frontend gating follows.

### 4.1 Backend (prerequisite)
Expose lock state in `GET /users/:id`. Add a derived boolean (preferred — no raw
timestamp needed by the UI):
`isLocked: boolean` = `lockoutUntil != null && lockoutUntil > now`.
Document it in `BACKEND_SPEC.md` §8 alongside the existing user fields.

### 4.2 Frontend
1. `src/types/types.ts` — add `isLocked?: boolean` to `profileDataType` (or to
   the management payload type that feeds `PersonalData`).
2. `PersonalData.tsx` — render `<Unlock>` only when `isLocked === true`.
3. `Unlock.tsx` — unchanged.

## 5. Acceptance criteria

- [ ] `GET /users/:id` returns `isLocked`.
- [ ] Unlock button appears only for users with `isLocked === true`.
- [ ] An Active, never-failed user shows **no** Unlock button.
- [ ] After 5 failed logins, the button appears; after clicking Unlock it
      disappears on re-fetch.

## 6. Verification

1. Lock a test user (5 wrong passwords). Search them in Manage → Unlock button
   present.
2. Click Unlock → re-search → button gone.
3. Search an Active, never-failed user → no Unlock button.

## 7. Interim option (if backend change is deferred)

Keep the button always-visible (current behavior) but relabel/tooltip it as
"Clear login lockout" so admins understand it is unrelated to Account Status.
No backend dependency. `ponytail:` smallest stopgap until §4.1 lands.
