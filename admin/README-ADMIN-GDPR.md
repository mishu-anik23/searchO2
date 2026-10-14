# SearchO2 Admin · Backend analysis & GDPR control plane

## Backend architecture (current)

| Layer | Location | Role |
|-------|----------|------|
| HTTP API | `backend/src/index.ts` | Express + Helmet + CORS + cookie-parser + rate limit |
| Auth | `backend/src/modules/auth/` | Register, login, Google, **guest** session, JWT access + refresh |
| Users / merge | `backend/src/modules/users/guestMerge.service.ts` | Guest → registered claim, recovery codes |
| Farm economy | `backend/src/modules/farm`, `economy` | Plot/worker/ledger persistence |
| Admin API | `backend/src/modules/admin/` | Stats, user 360°, session revoke, game adjust, audit |
| DB | PostgreSQL migrations `001`–`004` | users, farms, plots, sessions, audit, GDPR |

There is also a **Better Auth** style schema under `migrations/auth/0001_auth.sql` for the Vite/Neon path. The production game backend described here is the **Express + `users` / `farms`** stack.

## How guest accounts work

1. Client calls `POST /api/auth/guest` → creates `users.role = 'guest'`, starter `farms` row, JWT + refresh token.
2. **Server source of truth:** guest progress is in Postgres (`farms`, `plots`, `workers`, `economy_transactions`, …) keyed by `user_id`.
3. **Browser cache (not the only save):**
   - `localStorage.searchO2_token` — access token when API auth is used
   - `localStorage.searchO2_guest_user` — JSON snapshot of guest profile for offline UI
   - `localStorage.searchO2_last_valid_money` — anti-tamper money mirror in `index.html`
4. **Cross-device recovery:** `POST /api/auth/guest/recovery-code` issues `GUEST-XXXX-…` stored as **salted SHA-256** in `guest_recovery_secrets` (plaintext never stored).
5. **Upgrade:** register/login with `guestId` or recovery code → `GuestMergeService.mergeGuestIntoUser` moves farm ownership, marks guest `status = 'merged'`, revokes guest refresh tokens.

If the API is down, the static farm pages still run purely client-side; that local-only progress is **not** the same as the backend guest farm until the next successful auth/sync.

## What the admin dashboard adds

- UI: `/admin/dashboard.html` (and `public/admin/dashboard.html`)
- Migration `004_gdpr_admin_2fa_telemetry.sql` — consent ledger, privacy requests, consent-gated telemetry, processing register, bootstrap admin row
- Routes on `/api/admin` via `admin2fa.controller.ts`:
  - `POST /auth/bootstrap` — first password for `searcho2.online@gmail.com` (≥12 chars, complexity)
  - `POST /auth/login` — password step; flags TOTP enroll/challenge
  - `POST /auth/2fa/enroll/start|confirm` + `POST /auth/2fa/verify` — Authenticator app (QR + manual secret)
  - `POST /privacy/consent`, `GET /privacy/requests`, `GET /privacy/processing-activities`
  - `POST /telemetry/event` — **writes only if analytics consent is true**

## GDPR / Datenschutzerklärung rules implemented

- **Data minimisation:** telemetry IP stored as hash; UI masks IPs; coarse geo only.
- **Consent (Art. 7):** optional analytics/marketing require `consent_records`.
- **Legal bases documented** in `processing_activities` (Art. 30).
- **Rights:** `privacy_requests` for access / erasure / portability / objection (30-day deadline field).
- **Security:** bcrypt passwords, TOTP 2FA for admins, append-only `admin_audit_logs`.
- **No sale of data; marketing default off.**

## Bootstrap sequence

1. Run migrations including `004`.
2. Open `/admin/dashboard.html`.
3. **First password** tab → set password for `searcho2.online@gmail.com`.
4. **Login** with that password.
5. **2FA** tab → Generate QR → scan with Google Authenticator / Authy / Aegis → confirm code.
6. Verify challenge → Overview.

Store backup codes offline; they are shown once and kept hashed.
