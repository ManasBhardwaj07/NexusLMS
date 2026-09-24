# 01 — PRD: CodeAscend Web Platform v1 (v2.0 FINAL)

## 1. Problem
CodeAscend sells and delivers competitive-programming courses. No platform exists. We build the web
platform that runs the business: catalog → payment → delivery → live classes.

## 2. Users & roles
| Role | Needs |
|---|---|
| Visitor | Browse catalog, play free previews, buy a course |
| Student (18+) | Watch lectures, progress, resume, live classes, invoices/refund status |
| Student (minor, <18) | Same, AFTER verifiable parental consent; no analytics/tracking per DPDP §9 |
| Parent | Verify consent for a minor's account (email/phone verification link) |
| Mentor | Host live sessions (v1: via founder-managed YouTube; no mentor dashboard in v1 — confirmed acceptable) |
| Admin | CMS, pricing, coupons, refunds, revenue, reconciliation, audit log |

## 3. v1 scope — FROZEN (v2.0: minors handling added per DELTA-1; nothing else changed)
1. Public: home, catalog (search + filters), course detail (syllabus, mentors, price, inline preview), about/mentors
2. Auth: email/password + Google OAuth; roles; password reset; email verification; rate-limited;
   **date-of-birth capture at signup; minors gated until parental consent verified (DPDP §9)**
3. Admin CMS: course→module→lecture CRUD; Cloudflare Stream direct upload; publish/pricing
4. Payments: Razorpay embedded checkout; server-verified; webhook source of truth; idempotent; refunds;
   coupons (server-validated); manual Payment Links Wk3–4 via same verified path;
   **purchaser-of-record checkout variant PENDING Wk2 founder/CA decision**
5. Post-purchase: auto-enrollment; queued invoice email; dashboard; signed-URL player; per-lecture progress;
   resume; server-side gating
6. Live classes (cohort 1): scheduling; reminders; dashboard-gated rotated YouTube links; MANUAL same-day VOD ingest
7. Admin: revenue dashboard, refunds + audit log, coupons, mentor mgmt, manual order reconciliation
8. Platform: SEO, funnel analytics **(disabled for minor-flagged accounts)**, Sentry, uptime + webhook monitoring,
   legal page shells, DPDP consent records, data export/delete path

**v2 (untouchable):** mobile app, certificates, quizzes, subscriptions/EMI, referrals, offline, PWA,
in-app live SDK + auto-VOD pipeline (this is v1.1, post-cohort-1), push notifications, mentor dashboard.

## 4. Acceptance-bearing user stories
- US-1..US-8: as v1.0 (catalog browse/preview, buy→enroll→invoice, resume-any-device, direct-URL block,
  refund+audit, webhook replay-safety, live join, resumable admin upload)
- **US-9 (minor signup):** a 16-year-old signs up with DOB → account created in consent-pending state →
  parent receives verification link → parent verifies → account usable. Before verification: login OK,
  catalog browse OK, checkout/video blocked, analytics OFF.
- **US-10 (minor privacy):** for any minor-flagged account, zero GA4/funnel events fire; the data-export
  and account-deletion paths work for the account (and parent-requested deletion is honored).
- **US-11 (consent evidence):** every parental consent is stored with method, timestamp, and token —
  auditable for DPDP compliance.

## 5. NFRs
Availability 99% (webhook endpoint monitored separately) · rate limits day-1 on /auth/* and /payments/* ·
signed URLs 4–6h TTL · LCP <2.5s 4G; player start <3s throttled 3G · payment tables append-only with
idempotency anchors · **DPDP: consent before minor data processing; no tracking of minors; consent records auditable** ·
cost ≤ ₹9.5k/mo infra at 0–100 students.

## 6. Launch gates (success = these, not feature counts)
First cohort runs end-to-end; 10 clean test purchases incl. failure/replay/race/authorized-not-captured;
real production purchase with monitoring live; minors consent flow verified end-to-end.

## 7. Founder decisions still open (not blocking Wk1; blocking their stated weeks)
Brand palette · watermark visibility · **Wk2: GST + refund policy + purchaser-of-record/minors posture** ·
course pricing itself (his business call, needed before Phase 3 test data).
