# CODEASCEND — THE MASTER DOCUMENT (v2.0 FINAL)

*One file. Everything. If any other doc disagrees with this file, this file wins until v2.1.*
Compiled 23 Sep 2026 · Personas A (Senior Staff Architect) + B (SDE-3) · Source: codeascend-docs-v2 pack

---

## PART 0 — WHAT EACH FILE CONTAINS (the map)

| File | Contains | Has external items? |
| --- | --- | --- |
| **THIS FILE (MASTER.md)** | Everything, condensed + External Dependencies | ✅ §3 |
| `01-prd.md` | Product requirements: scope, user stories, NFRs, launch gates, UI/UX spec | ✅ §7 open decisions |
| `02-architecture-trd.md` | Systems design: topology, auth, payments, video, live, minors data-flow | (decision notes only) |
| `04-api-contract.md` | Every endpoint, auth, idempotency, error codes | ❌ |
| `05-uiux-spec.md` | Pages, components, states, tokens, minors screens | ✅ palette decision |
| `06-engineering-rules.md` | Code/git/test/security/freeze/placement rules (living doc) | ❌ |
| `07-execution-plan.md` | Week 1–15 plan, gates, buffer accounting, achievement log, launch checklists | ✅ external dependency column |
| `11-toolchain.md` | Toolchain versions and Next 15 impacts | ❌ |
| *(prisma/)* `schema.prisma` + `schema-notes.md` | Full data model + migration rules + seed plan | ❌ |
| *(skills/)* `product-readiness-audit/SKILL.md` | Phase-7 product readiness audit runbook & checklist mirror (09 Part B) | ❌ |
| *(external)* Decision Audit v1.1 | Architectural rationale record | ❌ |

---

## PART 1 — THE PROJECT IN 10 LINES

CodeAscend (QAVRYN's edtech brand) sells 2 competitive-programming courses online: catalog → free preview →
embedded Razorpay checkout → auto-enrollment → recorded video library + live classes. One solo developer.
72 working days / 15 weeks to production. Budget-conscious. Audience skews 16–18 (minors — DPDP applies).
Live classes v1 = YouTube Live + manual recording ingest (full SDK = v1.1 after cohort 1).
Success = first cohort runs end-to-end + real payments flow with monitoring — not feature count.

---

## PART 2 — LOCKED DECISIONS (changing any = written change control)

1. **Stack:** Next.js 14 App Router · Express (not NestJS) · Neon Postgres + Prisma · Upstash Redis + BullMQ ·
Vercel (web) + Render (API + worker) · Cloudflare Stream · Razorpay · Resend · Sentry. Monorepo, pnpm workspaces.
2. **Timeline:** 72 working days / 15 weeks (63 build + 9 buffer). Scope rejection of YouTube-Live → 16 weeks.
3. **Live v1:** unlisted YouTube Live, rotated dashboard-gated links (never emailed raw), manual same-day VOD ingest.
v1.1 SDK (100ms vs Cloudflare RealtimeKit spike at Wk9) after cohort 1.
4. **Auth:** one NextAuth JWT (JWE, 15-min sliding) `{uid, role, tv}`; shared `jose` verifySession() used by BOTH
Next.js and Express; revocation = tokenVersion bump + Redis key `tv:{uid}` delete (≤60s cache TTL; never a
per-request DB hit). Week-1 spike Days 1–3; **Day-3 not green → Clerk fallback, no exceptions.**
5. **Payments:** Razorpay Orders + Checkout.js; **webhook = source of truth**; idempotent by design
(webhook_events unique dedup; enrollment upsert in one txn; partial unique index: one ACTIVE enrollment per
user+course; Idempotency-Key on order/verify); AUTHORIZED state modeled; order-expiry job; refunds + audit row
in-txn; Test DoD = 10 clean + failed + replay + race + authorized-not-captured. Payment Links = manual Wk3–4
parallel revenue via the SAME verified path.
6. **Video:** Cloudflare Stream Direct Creator Upload (browser → provider, we store videoUid only); signed URLs
4–6h TTL client-cached; email watermark overlay; progress posts ~30s batched; course % computed on read.
7. **Data:** integer paise money · UTC timestamps · append-only payment tables · soft-delete nowhere.
8. **Minors (DPDP §9) — IN v1 scope:** DOB required at signup · under-18 gated until verifiable parental consent
(email/phone token, 48h, single-use, hashed at rest, IP/UA evidence) · analytics permanently OFF for minors via
single `track()` wrapper · data export/delete path for all users.
9. **Infra topology:** Vercel → Render (API+worker) → Neon; Upstash; Cloudflare (Stream/R2/DNS); organization-owned
accounts with separation of billing and member roles.
10. **Legal posture:** entity resolution Wk1 · GST + refund policy + minors posture decided Wk2 · legal page text + invoice format sign-off Wk12 hard blocker.

---

## PART 3 — 🎯 EXTERNAL DEPENDENCIES

| Item | Needed By | Impact if Late |
|---|---|---|
| **Razorpay account & approved KYC** | Wk1 (submission), Wk6 (approval) | Live-Mode cutover (Wk13) slips 1:1; blocks production revenue |
| **Domain & Cloudflare DNS access** | Wk1 | Email auth (SPF/DKIM/DMARC), warm-up, and SEO blocked |
| **YouTube brand channel live-enabled** | Wk1–2 | 24h activation delay risks Phase 5 (Wk9) dry-run failure |
| **Business entity status resolution** | Wk1 | Determines KYC business type and contract/tax structure |
| **GST policy, refund rules & minor posture** | Wk2 | Checkout fields and consent flows built twice if late |
| **Course content (~80h video & syllabus)** | Wk4 | Placeholder seed required; real-content QA and launch slip |

*Policy & Confirmation Items:*
- Brand palette (blocks UI tokens Wk1)
- Video player watermark confirmation (email overlay)
- Launch course pricing (required before Phase 3 test data)
- Legal page copy (Terms, Privacy, Refund) & invoice format (Wk12 hard launch blocker)
- Mentor confirmed for dry-run class (Wk9 gate)

*Progress update discipline: every Friday, written — what shipped (demo-able), what external dependencies are blocking, what is next.*

---

## PART 4 — PRD (condensed, complete)

**Users:** visitor · student (adult) · student (minor, gated until parental consent, no tracking) · parent (verifies
consent) · mentor (hosts live, no v1 dashboard — confirmed) · admin.
**v1 scope (frozen):** public catalog/home/detail w/ inline preview · auth (email+Google, DOB required, rate-limited)
· admin CMS (course→module→lecture, Stream upload, pricing/publish) · Razorpay embedded checkout + coupons + refunds

- Payment Links Wk3–4 · auto-enrollment + queued invoice email · dashboard + signed-URL player + progress + resume +
server-side gating · live classes (YouTube scope) · admin (revenue, refunds+audit, coupons, mentors, reconciliation) ·
SEO + funnel analytics (minors excluded) + monitoring + legal shells + DPDP consent records + data export/delete.
**v2 (untouchable):** app, certificates, quizzes, subscriptions, referrals, offline, PWA, live SDK + auto-VOD (this is
v1.1), push, mentor dashboard.
**Key stories:** US-1 logged-out preview playable · US-2 buy→enrolled→invoiced zero-manual · US-3 resume same
timestamp any device · US-4 direct URL to paid lecture → checkout redirect, never a frame · US-5 refund visible in
dashboard same session + audit row · US-6 duplicate webhook/browser race → exactly one enrollment + one email ·
US-7 live join from dashboard at T-0 · US-8 2 GB resumable admin upload · US-9 minor signup → parent verify → unlock ·
US-10 zero analytics events for minors · US-11 every consent auditable (method, time, token, IP/UA).
**NFRs:** 99% uptime (webhook monitored separately) · rate limits day-1 · signed URL 4–6h · LCP <2.5s 4G, player <3s
throttled 3G · payment tables append-only · DPDP consent-before-processing + no minor tracking · infra ≤ ₹9.5k/mo
at 0–100 students.
**Launch gates:** cohort runs end-to-end · payment Test DoD incl. failure/replay/race/authorized · real production
purchase with monitoring · consent flow verified E2E.

---

## PART 5 — ARCHITECTURE (condensed, complete)

**Topology:** Browser → Vercel (Next.js SSR/CSR) · Render Express API (+BullMQ worker dyno) → Neon Postgres (writes)
· Upstash Redis (rate-limit, tv-cache, queue) · Razorpay · Cloudflare Stream · Resend · Sentry/UptimeRobot (site +
API + `/payments/webhook` separately). Live v1 = unlisted YouTube Live, dashboard-gated, rotated links.
**Environments:** staging = Test-mode providers + Neon per-PR branches; prod cutover only at Phase 8 gate.
Secrets in platform secret stores only; rotation runbook required.
**Auth:** see Locked Decision 4. DOB at signup; `consentState` NOT_REQUIRED/PENDING/VERIFIED carried in session;
PENDING blocks /learn /payments /live. Adults: trackingConsent gates GA4.
**Payments flow:** Buy → server creates Razorpay order (Idempotency-Key) → Checkout.js modal → success returns
{payment_id, order_id, signature} → POST /verify (HMAC check) ∥ webhook payment.captured (signature + webhook_events
dedup) → EITHER path, first to commit: txn(order PAID, payment upsert, enrollment upsert) → enqueue invoice →
"My Courses" unlocked. Refund: Razorpay refund + enrollment status per Wk2 policy + credit-note fields + audit row.
**Video:** browser → Stream Direct Creator Upload (TUS) → store videoUid only → playback via /play endpoint
(enrollment/preview check) → signed URL 4–6h → Stream player + email watermark → progress 30s batched → % computed on read.
**Minors data-flow:** signup(DOB) → <18 = consent-pending (browse OK, learn/checkout blocked, analytics off) → parent
token link → verify → ACTIVE (analytics still off forever for minors) → export/delete honored (parent-verified for minors).
**Email:** Resend from mail.codeascend.in (SPF/DKIM/DMARC Wk1); all sends queued jobs with retry + DLQ; warm-up real
sends from Wk3.
**Scaling hooks:** 100 students = UX bugs not infra · 1k = paid tiers + 2nd dyno (budgeted) · 10k = Stream delivery
~$2k/mo + progress write pressure → 60s batching + read replica. None change v1 architecture.
**Known v1 limitations (documented, deliberate):** YouTube Live trade-offs · manual ingest · no DRM (signed URLs +
watermark; screen-recording unstoppable at this tier — known tradeoff) · minors = no analytics by law.

**Known Deltas:** All v1.0–v2.0 gaps patched; fixes live in `prisma/schema.prisma` (actorType, tokenHash, relatedOrderId), `prisma/schema-notes.md` v2.1, and `docs/06-engineering-rules.md` §9/§11.

---

## PART 6 — DATA MODEL (condensed; full Prisma in `prisma/schema.prisma`)

**Tables:** users (+ dateOfBirth, isMinor, trackingConsent, consentState, tokenVersion) · accounts (OAuth) ·
verification_tokens · parental_consents (method, parent contact, **tokenHash** bcrypt-hashed at rest + 48h expiry, verifiedAt,
ip, userAgent) · courses · modules · lectures (videoUid only) · live_sessions · orders (idempotencyKey unique,
razorpayOrderId unique) · payments (razorpayPaymentId unique) · enrollments (orderId unique; partial unique:
one ACTIVE per user+course) · lecture_progress (@@unique enrollment+lecture) · coupons (usedCount = cached counter only;
enforcement reads redemption rows in-txn) · coupon_redemptions · webhook_events (providerEventId unique; relatedOrderId for reconciliation) ·
admin_actions (actorType: ADMIN|SYSTEM; adminId nullable for automated jobs; append-only).
**Migration 0003 (conditional, post-Wk2):** purchaser-of-record columns on orders if parent-as-buyer decided.
**Hard rules:** paise-only · UTC · append-only payments · every payment write = txn incl. idempotency/audit row ·
isMinor server-derived only · consent tokens hashed at rest · Neon branch-per-PR · seed includes minor +
verified-consent test accounts.
**Idempotency anchor per write path:** order create = Idempotency-Key · payment/enrollment = razorpayPaymentId +
webhook_events · progress = @@unique · consent = single-use token · coupon use = redemption row in-txn.

---

## PART 7 — API (condensed; full contract in `04-`)

Base `/api/v1`, envelope `{ok, data|error{code,message}}`, bearer JWT.
**Auth (5/min/IP):** register (email+password+**DOB required**+consent) · verify-email · forgot/reset (reset bumps
tokenVersion) · session → {uid, role, isMinor, consentState, trackingConsent}.
**Consent:** /consent/parental/request ◆ · /status · /verify (public, token) · /me/data-export · DELETE /me/account.
**Catalog (public):** /courses (filters) · /courses/:slug · /courses/:slug/preview (signed URL, no auth).
**Student:** /me/enrollments · /resume · /me/lectures/:id/progress ◆ · /me/lectures/:id/play (signed URL) · /me/orders.
**Payments (20/min/user):** /payments/order ◆ · /verify ◆ · /webhook (sig-verified, deduped, fast 200) ·
/payments/links/ingest (admin, manual links) · /payments/parent-confirm (404 until Wk2 decision enables).
**Live:** /me/courses/:id/live · admin schedule/start/complete/link-recording.
**Admin:** course/module/lecture CRUD · publish · coupons · stats · refund · reconcile · audit-log · reconciliation —
every mutation writes AdminAction in-txn.
**System:** /health · /sitemap.xml.
**Errors:** v1 set + CONSENT_REQUIRED 403 · CONSENT_TOKEN_INVALID 400 · MINOR_CHECKOUT_BLOCKED 403.
**Gating:** PENDING-consent sessions get 403 CONSENT_REQUIRED on learn/payments/live.

---

## PART 8 — UI/UX (condensed; full spec in `05-`)

Mobile-web-first, 360px base; SSR catalog; every page has loading/empty/error; a11y AA; 16 pages + components.
**v2.0 screens:** signup w/ DOB picker + consent checkbox · consent-pending screen (browse OK, resend parent link) ·
parent verification page (single-use token; expired/used → re-request) · minors "tracking disabled" note in settings ·
checkout parent-confirmation variant (pending Wk2) · settings: consent status, export, delete (parent-verified for minors).
Tokens: semantic color slots (palette decision pending) · Inter · 4pt grid · dark mode NOT v1.
Analytics: GA4 events only via single `track()` = trackingConsent && !isMinor.

---

## PART 9 — ENGINEERING RULES (condensed; full in `06-`)

Monorepo /web /api /packages{shared-types, auth, analytics} /docs /prisma · conventional commits, PRs only, CI green ·
TS strict, no silent any · modules/{routes,controller,service,repository} + dependency-cruiser boundary enforcement ·
zod at every boundary · pino + request-id · paise + UTC · security day-1 (rate limits, helmet, CORS allowlist,
bcrypt 12, webhook sig verify, npm audit CI) · tv-cache rule (§4) · mandatory unit tests (payments logic, consent
lifecycle, gating matrix, track() no-op) · payment bug fixes ship with regression tests · DoD = gate + CI + runbooks +
Friday update + achievement log · runbooks before launch (rotation, webhook-incident, refund, live-ingest, rollback,
minors-data-request, db-restore-drill) · **never:** secrets in repo · client-side price math · access on browser
callback alone · raw live links in email · raw video files · payment amount edits · admin mutation without audit row ·
isMinor/consent from clients · analytics outside track() · breaking the freeze quietly.
**Freeze:** v1 = PRD scope. Breaks only for: legal/compliance requirement, security fix with no smaller mitigation,
or formal timeline re-quote in writing. Scope asks → v2 backlog + 24h written impact reply, never silently absorbed.

---

## PART 10 — EXECUTION PLAN (complete)

72 working days = 63 build + 9 buffer, 15 weeks. (Phase 1 grew 6→8 for minors feature; buffer 7→9.)

| Wk | Build | Gate | External dependency (late → impact) |
| --- | --- | --- | --- |
| 1 | Repo/CI/Neon/Upstash/Prisma v2.0 schema/Sentry | boots 1 cmd, CI green, migration clean | KYC submitted · domain+CF+DNS · YouTube live-enabled · entity answer (KYC late 1wk → Live cutover slips 1:1) |
| 2 | Auth spike D1–3 (Clerk fallback D3) → auth + DOB + minors gating + consent flow | signup×2, guards, rate limits, consent tests green | **Wk2 three-in-one: GST + refund + minors posture** (late >1wk → built twice) |
| 3–4 | CMS, Stream upload, catalog, detail, SEO, seed ∥ Payment-Links ingest | courses browsable, preview plays logged-out, paid blocked | content (late → QA/launch slip) · first real revenue via links |
| 5–6 | Razorpay order/verify/webhook/refund/expiry | 10 clean + failed + replay + race + authorized-not-captured | KYC approved (late 1wk → cutover slips 1:1) |
| 7–8 | Player, progress, resume, dashboard, gating | resume works; direct-URL block | legal text started (soft) |
| 9 | Live (YT scope) + dry-run | dry-run w/ mentor + 2 students; same-day ingest | mentor confirmed · v1.1 SDK spike decision |
| 10 | Admin dashboard, refunds+audit, coupons, reconciliation | refund same-session; coupon math correct | — |
| 11–12 | Unit+E2E suites, 3G player, bursts, URL expiry, consent E2E, restore drill | E2E green; security checks pass; drill done | legal final + invoice sign-off (late → launch slips; hard blocker) |
| 13 | Prod deploy, domain, Live-Mode cutover, monitoring | real purchase on prod; monitors alert | DNS (since Wk1) |
| 14–15 | Buffer (5d) + 4 floating | — | pre-spent buffer = red flag |

Cadence: build Mon–Fri vs current row · daily 3-line private log · Friday written progress update · dated achievement
log. Gates: no phase starts until prior gate passes; P0 security fix may interrupt any phase. Escalation verbatim:
dependency >5d late → same-day written log + re-quote + continue unaffected tracks · payment test failure → stop
Phase 3 until root-caused · scope request → v2 default, written delta before acceptance.

---

## PART 11 — KYC & PAYMENT GATEWAY ESSENTIALS

Test Mode = instant, no KYC, all dev happens there. Live Mode needs KYC approval (2–7 working days, resubmissions
cost days). Business type determination (registered entity vs sole proprietorship) sets documentation requirements.
Prerequisites: PAN, address proof, bank + cancelled cheque, website URL, phone/email, low volume profile.
Common rejection causes: name mismatch, blur, address mismatch, unreachable website URL, inflated volume profile.
On approval: Live API keys → Render prod environment variables only; role-based access for development team.
Track status every 2 days. Submission required by end-Wk1; approval required by end-Wk6 or cutover slips 1:1.

---

## PART 12 — RISKS & THE FINALIZED TASKS

**Top risks:** A: (1) Wk2 policy decisions slip, (2) KYC rejection loop eating Wk1–6, (3) track()-wrapper discipline
eroding mid-project. B: (1) auth spike failing slowly not fast — honor Day-3 Clerk trigger, (2) content "almost ready"
at Wk4 starving the Phase 7 real-video QA, (3) scope creep as a pile of "small asks."
**Week 1 (finalized):** D1 org+repo+2FA+protection, pack to /docs, trigger external dependencies · D2 toolchain + accounts
+ OAuth client + Resend test · D3 monorepo scaffold + CI · D4 full schema + migration + Neon branch proof · D5 Sentry
+ /health + env convention + gate check + Friday progress update.
**Week 2 (finalized):** D1–3 auth spike (go/no-go D3 → Clerk) · D4 DOB signup + isMinor + consentState + consent
checkbox + rate limiter + email verification · D5 parental-consent endpoints + parent email template + gating +
consent unit tests + **record Wk2 policy decisions** + gate + Friday progress update.
**Everything after Wk2 stays gated per PART 10 — no further task lists finalize until each week's gate passes.**

---

*Next actions, in order: send F-1..F-4 today → execute Week 1 → Friday update → Week 2 incl. the three-in-one
meeting → hand this MASTER + pack to your external reviewer (checklist: `09` Part B).*