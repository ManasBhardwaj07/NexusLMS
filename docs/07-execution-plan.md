# 07 — Master Execution Plan v2.0 FINAL — Week 1–14 (solo dev)

Estimate: 63 build days + 7 buffer days = **70 working days / 14 weeks** (v2.0: Phase 1 grew 6→8 days for
DOB capture + parental-consent flow per DELTA-1; buffer shrank 9→7). Founder rejection of the YouTube-Live
scope change → +9 days → 16 weeks (his written call).

| Wk | Focus | Visible to founder by end | Gate (binary) | Founder dep due (late by X → Y) |
|---|---|---|---|---|
| 1 | Phase 0: repo/CI/Neon+Upstash/Prisma v2.0 schema+migration/Sentry | Nothing visible — infra only; KYC in motion | Boots in 1 cmd; CI green; migration clean | **KYC submitted · domain+CF+DNS · YouTube live-enabled · entity answer** (KYC late 1wk → Live cutover slips 1:1) |
| 2 | Auth spike D1–3 (Clerk fallback D3) → auth build + **DOB + minors gating + parental-consent flow** | Can sign up (both methods); minor test account shows consent flow | Signup×2, guards 401/403, rate limits, **consent token lifecycle tests green** | **Wk2 three-in-one: GST + refund policy + minors posture** (late >1wk → checkout/consent built twice) |
| 3–4 | Phase 2: CMS, Stream upload, catalog, detail, SEO, seed both courses | Both courses browsable; preview plays logged-out | Search/filter/preview/block-by-direct-URL pass | **Course content** (late → placeholders; QA+launch slip) |
| 3–4 ∥ | Payment-Links ingest endpoint; founder issues links manually | **First real revenue possible** | Link purchase → same verified txn path | founder action |
| 5–6 | Phase 3: Razorpay order/verify/webhook/refund/expiry | Embedded checkout works end-to-end (Test) | 10 clean + failed + replay + race + authorized-not-captured | **KYC approved** (late 1wk → Live cutover slips 1:1) |
| 7–8 | Phase 4: player, progress, resume, dashboard, gating | Enrolled experience complete | Resume works; direct-URL block verified | legal text started (soft) |
| 9 | Phase 5 (YT scope): scheduler, reminders, join, dry-run class | First real live class | Dry-run with mentor + 2 students; manual ingest same day | mentor confirmed; **v1.1 SDK spike decision (100ms vs RealtimeKit)** |
| 10 | Phase 6: admin dashboard, refunds+audit, coupons, reconciliation | Admin can refund/coupon/read revenue | Refund same-session visible; coupon math server-correct | refund-policy decision already made Wk2 (build only here) |
| 11–12 | Phase 7: unit+E2E suites, 3G player, rate-limit bursts, URL expiry, **consent-flow E2E**, restore drill | Nothing new visible — reliability proven | E2E green in CI; security checks pass; restore drill done | **legal copy final + invoice format sign-off** (late → launch slips; hard blocker) |
| 13 | Phase 8: prod deploy, domain, Live-Mode cutover, monitoring | Site live; real payments | Real low-value purchase; invoice received; monitors alert | DNS access (exists since Wk1) |
| 14 | Buffer (5d) + 2 floating buffer days | — | Reserved; pre-spent = red flag | — |

Critical path unchanged: KYC (Wk1) → Wk2 decisions → content (Wk4) → legal (Wk12).
Cadence/gates/escalation/freeze/risk register: v1.0 §2–§6 verbatim (unchanged and still binding).
