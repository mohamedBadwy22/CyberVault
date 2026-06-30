# CyberVault FE↔BE Integration — Spec-Kit

Specs to fix the frontend/backend integration defects found in the
`updated-frontend` branch. Each spec is self-contained: problem, evidence,
design, acceptance criteria, verification.

## Execution order (by necessity)

| Priority | Spec | Title | Blocks |
|----------|------|-------|--------|
| **P0 — critical** | [SPEC-001](./SPEC-001-refresh-token-rotation.md) | Refresh-token rotation persistence & single refresh path | Causes forced logout / `access token expired`. App is unusable past one token rotation. |
| **P1 — correctness** | [SPEC-002](./SPEC-002-remove-duplicate-nextauth-route.md) | Remove dead duplicate NextAuth route | Confusing shadow route; risk of mis-mounted auth endpoints. |
| **P2 — feature** | [SPEC-003](./SPEC-003-unlock-button-visibility.md) | Gate "Unlock" button on real lock state (needs backend field) | Admins can't tell who is actually locked; button is meaningless noise. Backend-dependent. |
| **P2 — feature** | [SPEC-005](./SPEC-005-change-password-split.md) | Split forced vs. voluntary password change | Voluntary change should render inline in profile; `/change-password` route hardened to forced first-login only. |
| **P3 — hygiene** | [SPEC-004](./SPEC-004-hygiene-cleanups.md) | Code hygiene cleanups | No runtime impact; reduces 3am-decode cost. |

Do **P0 first** — it is the bug the user reported. P1 is a safe standalone
delete. Of the P2s: SPEC-003 needs a backend field before the frontend can act;
SPEC-005 is frontend-only (route gating + inline render). P3 is optional polish,
batch it last.

## Scope

- In scope: the Next.js ↔ backend auth/refresh integration, the duplicate
  route, the Unlock UX, and small correctness cleanups.
- Out of scope: backend implementation (owned by `BACKEND_SPEC.md`), visual
  redesign, new features.

## Source-of-truth references

- Backend contract: `BACKEND_SPEC.md` (cited by section number, e.g. §7.3).
- Token confidentiality is already correct — see SPEC-001 §"Non-goals".
