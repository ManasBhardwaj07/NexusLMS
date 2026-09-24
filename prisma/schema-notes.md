# 03 — Database Schema Notes v2.0

## Raw-SQL additions (first migration, alongside Prisma migrate)
1. `CREATE UNIQUE INDEX one_active_enrollment ON enrollments (user_id, course_id) WHERE status = 'ACTIVE';`
2. `CREATE INDEX course_title_trgm ON courses USING gin (title gin_trgm_ops);` (enable pg_trgm in migration 0002)
3. **Migration 0003 (conditional, after Wk2 decision):** purchaser-of-record columns on orders
   (e.g. `purchaser_name TEXT`, `purchaser_relationship TEXT`, `parent_confirmed_at TIMESTAMPTZ`) —
   applied ONLY if the founder/CA decision requires the parent-as-buyer flow.

## v2.0 rules (added; v1.0 rules unchanged below)
- `isMinor` is derived at DOB capture and NEVER user-editable. No endpoint accepts isMinor from clients.
- `consentState`: NOT_REQUIRED (adult) | PENDING (minor, awaiting parent) | VERIFIED. Middleware enforces:
  PENDING blocks /learn/*, /payments/*, live join. Analytics blocked for isMinor regardless of state.
- ParentalConsent tokens: single-use, 48h expiry, IP + user agent stored as evidence.
- tokenVersion caching: Redis key `tv:{userId}`, TTL ≤60s; bump must delete the key in the same operation.

## v2.1 fixes (09-blind-spot-review §6 sync — applied 24 Sep 2026)
- `ParentalConsent.token` renamed to `tokenHash` — bcrypt-hashed at rest; plaintext lives only in the emailed link.
- `Coupon.usedCount` annotated as a **cached counter only** — source of truth for maxUses enforcement is `COUNT(CouponRedemption)` inside the same transaction as the new redemption insert. Never skip the txn-level count.
- `WebhookEvent.relatedOrderId` (nullable String) added — fast FK for reconciliation lookups. Not enforced as a FK at DB level (webhook can arrive before order is confirmed) but populated by the webhook handler.
- `AdminAction.actorType` (enum `ADMIN | SYSTEM`) added; `adminId` is now nullable so BullMQ expiry jobs and system processes can write audit rows without a human actor ID.

## v1.0 rules (carried forward, still binding)
- Money = integer paise, never floats. Dates UTC; IST only at display edge.
- Payment-adjacent tables append-only. Every payment write is a transaction that also writes the
  idempotency/audit row. `enrollments.progress_percent` (if later denormalized) is worker-recomputed, never hand-edited.
- Soft-delete nowhere. Neon branch-per-PR for all migration testing.
- Seed script (Phase 2 gate): both launch courses per roadmap §7, 1 admin, 1 mentor, 5 students
  (one seeded as minor + one with verified parental consent, to E2E-test gating), 1 test coupon,
  short placeholder videos per lecture.
