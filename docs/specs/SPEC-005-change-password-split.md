# SPEC-005 — Split forced vs. voluntary password change

**Priority:** P2 (feature + route hardening)
**Status:** proposed
**Affected files:** `src/proxy.ts`,
`src/app/home/(user)/profile/page.tsx`,
`src/app/_components/ChangePassword/ChangePassword.tsx` (small prop),
`src/app/change-password/page.tsx` (unchanged)

---

## 1. Problem

There are two reasons a user changes their password, and today both funnel
through the standalone `/change-password` route:

1. **Forced (first-login):** backend returns `mustChangePassword: true`; the user
   is redirected to `/change-password` and cannot use the app until they change
   it. **Keep exactly as-is.**
2. **Voluntary:** a normal user (`mustChangePassword: false`) clicks "Change
   Password" in their profile. Today this is a `<Link href="/change-password">`
   (`profile/page.tsx` line 72) — a full navigation to the same security-gate
   route.

Desired: the voluntary case should render the `ChangePassword` component
**inline on the profile page** (no navigation), and the `/change-password` route
should be reachable **only** by forced (`mustChangePassword === true`) users.

## 2. Current behavior (evidence)

- `src/proxy.ts`:
  - line ~30: if `mustChangePassword === true` and path ≠ `/change-password` →
    redirect to `/change-password` (the forced gate — correct).
  - line 17: `/change-password` is in the `accessibility` map for all three
    roles, so any authenticated user can open it directly.
- `src/app/home/(user)/profile/page.tsx` line 71–76: "Change Password" is a
  `<Link href="/change-password">`.
- `src/app/change-password/page.tsx`: renders `<ChangePassword />` under a
  "Security Requirement" heading.
- `src/app/_components/ChangePassword/ChangePassword.tsx` `onSubmit`: on success
  it re-signs-in (backend invalidates tokens on password change) then
  `router.push("/home")`.

## 3. Design (lazy — reuse the existing component and profile state)

### 3.1 Profile page — toggle inline instead of navigating
`profile/page.tsx` is already a client component with state. The two top buttons
("My Profile" / "Change Password") become tabs:

1. Add `const [tab, setTab] = useState<"profile" | "password">("profile")`.
2. Replace the `<Link href="/change-password">` with a `<button onClick={() =>
   setTab("password")>`; make "My Profile" set `tab` back to `"profile"`.
3. Render `<PersonalData …>` when `tab === "profile"`, else `<ChangePassword …>`.

No new route, no redirect.

### 3.2 Route hardening — gate `/change-password` to forced users only
In `src/proxy.ts`, add: if `pathname === CHANGE_PASSWORD_PATH` and
`mustChangePassword !== true`, redirect to `/home/profile`. Keep the existing
forced-redirect rule (line ~30) untouched. The route then serves **only**
first-login users; everyone else does it inline per §3.1. Remove
`/change-password` from per-role gating reliance only if it conflicts — the new
`mustChangePassword` gate is the authoritative rule for this path.

### 3.3 ChangePassword — make post-success destination caller-controlled
The component hardcodes `router.push("/home")`. Add one optional prop so the two
callers differ only in their tail behavior; default preserves current behavior:

- `onSuccess?: () => void` (or `redirectTo?: string`, default `"/home"`).
- Forced page (`change-password/page.tsx`): pass nothing → keeps redirect to
  `/home`.
- Profile inline: pass `onSuccess={() => setTab("profile")}` (re-sign-in still
  runs; after it, return to the profile tab instead of navigating).

`ponytail:` keep the re-sign-in block as-is in both paths — token invalidation
on password change applies regardless of entry point. Only the final
navigation/tab differs.

## 4. Non-goals

- The forced first-login flow, its `/change-password` page, and its copy are
  unchanged.
- The re-sign-in-after-change logic is unchanged (still required).

## 5. Acceptance criteria

- [ ] A `mustChangePassword === false` user clicking "Change Password" in profile
      sees the form **inline**; the URL stays on `/home/profile`.
- [ ] That user navigating directly to `/change-password` is redirected to
      `/home/profile`.
- [ ] A `mustChangePassword === true` user is still forced to `/change-password`
      and can reach it.
- [ ] Voluntary change succeeds: password updates, session re-established, and
      the view returns to the profile tab (no `/home` bounce required).
- [ ] Forced change still ends on `/home`.

## 6. Verification

1. Log in as a normal user → profile → "Change Password" → form renders inline,
   URL unchanged. Submit a valid change → success toast, back on profile tab,
   still logged in.
2. As that user, manually visit `/change-password` → redirected to
   `/home/profile`.
3. Seed/force `mustChangePassword: true` → log in → forced to `/change-password`,
   form reachable, change succeeds → lands on `/home`.
