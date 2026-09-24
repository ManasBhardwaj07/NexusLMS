# 02 — TRD / System Architecture v1 (v2.0 FINAL)

## 1. Stack (locked) — unchanged from v1.0
Next.js 14 (App Router, TS, Tailwind) · Express (module-folder convention, NOT NestJS) · Neon Postgres + Prisma ·
Upstash Redis + BullMQ · Vercel (web) · Render (API + worker) · Cloudflare Stream · Razorpay · Resend · Sentry.
Monorepo, pnpm workspaces. Rationale: Decision Audit v1.1 §1.2/1.6 — not re-litigated here.

## 2. Topology — unchanged from v1.0
```
Browser → Vercel (Next.js SSR/CSR) ──► Neon Postgres
        └─ Render API (Express) ──► Neon (writes) ──► Upstash Redis (rate-limit, tokenVersion cache, BullMQ)
              ├─ Razorpay (Orders/Checkout/Webhooks)     ├─ BullMQ worker: emails, reminders, order expiry
              ├─ Cloudflare Stream (upload, signed URLs) └─ Sentry + UptimeRobot (site + API + /payments/webhook)
              └─ Resend (mail from mail.codeascend.in)
Live v1: unlisted YouTube Live, dashboard-gated, per-session rotated links, manual VOD ingest
```

## 3. Environments & secrets — unchanged (staging = Test-mode providers + Neon branches; prod cutover at Phase 8 gate)

## 4. Auth architecture v2.0 (single-token + DELTA-3 Redis-cached revocation)
- NextAuth (Auth.js): Credentials (bcrypt, Node runtime only — never Edge) + Google OAuth (Prisma adapter).
- ONE token: NextAuth JWT (JWE, 15-min TTL, sliding renewal) carrying `{ uid, role, tv }` (tv = tokenVersion).
- Both Next.js and Express verify the same token via `jose` + shared `AUTH_SECRET`, through one shared
  `verifySession()` in `/packages/auth`. (jose — never `jsonwebtoken` — so verification is Edge+Node portable.)
- **Revocation (DELTA-3):** `users.token_version` is cached in Redis with **≤60s TTL**; verifySession checks the
  cache, falling back to Postgres on miss. On logout-all / password change / admin kill: bump the column AND
  delete the Redis key → global kill within ≤15 min via token expiry, ≤60s via cache for active verifiers.
  No per-request Postgres round-trip. Cache key: `tv:{uid}`.
- Rate limits: 5/min/IP login/signup; 3/hour/IP reset-request.
- **DOB + minors (DELTA-1):** signup captures `dateOfBirth` (required). `isMinor` derived at capture (<18).
  Minor + no verified parental consent → session token carries `consentState: PENDING`; middleware blocks
  /learn/*, /payments/*; analytics wrapper blocks all events (§8 below).
- **Week-1 spike (Days 1–3), Clerk fallback trigger unchanged:** split Edge/Node config, shared jose verify,
  Redis tv-cache, cross-system logout, account-linking collision, minor-gating middleware. Not green by Day 3 → Clerk.

## 5. Payments (normative — unchanged from v1.0)
Full spec per Audit Task 4(b)/(e): server-side order creation; `Idempotency-Key` on order/verify;
single-transaction enrollment upsert; `webhook_events` dedup; partial unique index one ACTIVE enrollment;
order-expiry job; AUTHORIZED state; refunds + audit row in-txn; Test-Mode DoD incl. failed/replay/race/
authorized-not-captured; Payment Links via same verified path Wk3–4.
**v2.0 addition:** checkout may require purchaser-of-record confirmation for minor buyers (parent name +
checkbox) — schema fields land via migration 0003 ONLY if the Wk2 decision requires it. Build the seam now
(config flag), the fields when decided.

## 6. Video — unchanged from v1.0 (Stream Direct Creator Upload, signed URLs 4–6h, email watermark,
30s batched progress, progress computed on read).

## 7. Live classes v1 — unchanged (YouTube Live scope; manual ingest runbook; v1.1 SDK decision gate Wk9).

## 8. Minors data-flow (DELTA-1 — new section)
```
Signup (DOB required)
  ├─ ≥18 → normal account; trackingConsent checkbox gates GA4
  └─ <18 → isMinor=true; account CONSENT_PENDING: catalog/browse OK; learn/checkout blocked
           → POST /consent/parental/request → parent email/phone with single-use token link
           → parent opens link → POST verify → consent stored (ParentalConsent row, auditable)
           → account ACTIVE (full access; analytics still permanently OFF for minors per DPDP §9)
Analytics rule (enforced centrally): fire event ONLY if trackingConsent=true AND isMinor=false.
   One wrapper `track()` in /packages/analytics; nothing else in the codebase touches GA4 directly —
   this makes the rule enforceable (rules without enforcement are wishes).
Data subject rights: /me/data-export and account-deletion work for all users; parent-initiated deletion
   for a minor's account is honored via the same flow with parental verification.
```

## 9. Email — unchanged (Resend, subdomain, SPF/DKIM/DMARC Wk1, warm-up from Wk3, queued jobs + DLQ).

## 10. Observability & integrity — unchanged (Sentry; UptimeRobot incl. separate /payments/webhook monitor;
pino logs with request-id; Razorpay ids logged, secrets never; PITR before Live-Mode cutover).

## 11. Scaling hooks & known v1 limitations — unchanged from v1.0
(limitations: YouTube Live trade-offs, manual ingest, no DRM — signed URLs + watermark only, expectation
documented with founder; minors = no analytics by law, not by choice).
