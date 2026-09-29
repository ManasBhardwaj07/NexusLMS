# 07 — Master Execution Plan v2.0 FINAL — Week 1–15 (solo dev)

Estimate: 63 build days + 9 buffer days = **72 working days / 15 weeks**. (Timeline adjusted to 15 weeks to accommodate real-world blockers without micromanaging buffer days. 16 weeks acceptable if major blockers occur).

| Wk | Focus | Milestone / Output | Gate (binary) | External dependency (late by X → Y) |
|---|---|---|---|---|
| 1 | Phase 0: repo/CI/Neon+Upstash/Prisma v2.0 schema+migration/Sentry | Nothing visible — infra only; KYC in motion | Boots in 1 cmd; CI green; migration clean | **KYC submitted · domain+CF+DNS · YouTube live-enabled · entity answer** (KYC late 1wk → Live cutover slips 1:1) |
| 2 | Auth spike D1–3 (Clerk fallback D3) → auth build + **DOB + minors gating + parental-consent flow** | Can sign up (both methods); minor test account shows consent flow | Signup×2, guards 401/403, rate limits, **consent token lifecycle tests green** | **Wk2 three-in-one: GST + refund policy + minors posture** (late >1wk → checkout/consent built twice) |
| 3–4 | Phase 2: CMS, Stream upload, catalog, detail, SEO, seed both courses | Both courses browsable; preview plays logged-out | Search/filter/preview/block-by-direct-URL pass | **Course content** (late → placeholders; QA+launch slip) |
| 3–4 ∥ | Payment-Links ingest endpoint; manual link issuance | **First real revenue possible** | Link purchase → same verified txn path | External link distribution |
| 5–6 | Phase 3: Razorpay order/verify/webhook/refund/expiry | Embedded checkout works end-to-end (Test) | 10 clean + failed + replay + race + authorized-not-captured | **KYC approved** (late 1wk → Live cutover slips 1:1) |
| 7–8 | Phase 4: player, progress, resume, dashboard, gating | Enrolled experience complete | Resume works; direct-URL block verified | legal text started (soft) |
| 9 | Phase 5 (YT scope): scheduler, reminders, join, dry-run class | First real live class | Dry-run with mentor + 2 students; manual ingest same day | mentor confirmed; **v1.1 SDK spike decision (100ms vs RealtimeKit)** |
| 10 | Phase 6: admin dashboard, refunds+audit, coupons, reconciliation | Admin can refund/coupon/read revenue | Refund same-session visible; coupon math server-correct | refund-policy decision already made Wk2 (build only here) |
| 11–12 | Phase 7: unit+E2E suites, 3G player, rate-limit bursts, URL expiry, **consent-flow E2E**, restore drill | Nothing new visible — reliability proven | E2E green in CI; security checks pass; restore drill done | **legal copy final + invoice format sign-off** (late → launch slips; hard blocker) |
| 13 | Phase 8: prod deploy, domain, Live-Mode cutover, monitoring | Site live; real payments | Real low-value purchase; invoice received; monitors alert | DNS access (exists since Wk1) |
| 14–15 | Buffer (5d) + 4 floating buffer days | — | Reserved; pre-spent = red flag | — |

Critical path unchanged: KYC (Wk1) → Wk2 decisions → content (Wk4) → legal (Wk12).
Cadence/gates/escalation/freeze/risk register: v1.0 §2–§6 verbatim (unchanged and still binding).

## Gate Criteria Details
- **Week 1 GATE:** boots in 1 cmd, CI green, migration clean.
- **Week 2 GATE:** both signup paths + consent flow + guards + rate limits green in CI. (Record Wk2 policy decisions: GST + refund policy + minors posture).

## Phase 7 Verification Checklist
- [ ] Walk the 5 flows as user / attacker / Razorpay-retry-logic against `02-architecture-trd.md`
- [ ] Name the idempotency anchor of every write path (payments: razorpayPaymentId + webhook_events + Idempotency-Key; progress: @@unique; consent: single-use token; enrollment: partial unique index)
- [ ] Cross-check every UI screen in `05-uiux-spec.md` against `03-api-contract.md`
- [ ] Confirm no money-as-float anywhere; every admin mutation writes AdminAction
- [ ] Verify every rule in `06` has an enforcement mechanism (CI, lint, or central wrapper)
- [ ] Challenge the 70-day figure bottom-up one more time against the Wk table
- [ ] The honesty test: anything you'd be embarrassed to explain in a month-3 review or interview?

## Achievement Log
*Running record — update every Friday; feeds the weekly progress update.*

**24 Sep 2026:**
- Repo live, branch protection + CI enforced, planning pack committed.
- Restored repo to exact Day-1 state (docs/ pack, skeleton dirs, bootstrap CI, NO code).
- Configured CODEOWNERS with repo lead and business handles.
- Documented external dependency requirements F-1 to F-4.
- Applied v2.1 schema fixes (tokenHash, actorType, relatedOrderId, usedCount annotation).
- Repo finalization: 6 files removed/merged/archived, docs at 11-file cap, structure locked.
- 24 Sep — skills restored as Phase-7 runbook (full text), real CI gates live (docs cap, placement law, secrets enforced on every PR), branch protection updated. Repo infrastructure complete.

**28 Sep 2026:**
- Week 1 Day 4 complete: DB schema audited and locked (v2.1), Neon connection branching workflow proven with synthetic seed data, guardrails codified.
- Week 1 Day 5 complete: /health endpoint deployed on Express api, proxied by Next.js. Sentry configured for web and api using environment tagging and clean .env practices. Env & secrets conventions codified in rules.
- Week 1 GATE CHECK: PASS. All services boot concurrently, endpoints work, DB schema verified, placement scripts green, no credential leaks detected, idempotency guards active.
- Fix-First PR complete: Refactored `api/src/index.ts` to module pattern, added dependency-cruiser gates, fixed proxy hardcoding.

**29 Sep 2026:**
- Next 15 migration committed and merged (0 critical/0 high); docs consolidated 12→8 per section-not-file; dependency churn, toolchain drift, and docs bloat all structurally closed in one day.
