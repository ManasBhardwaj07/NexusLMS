# 10 — Changelog, Final Risks & The Only Finalized Task Lists

## A. Changelog v1.0 → v2.0 (the 10-line version)
1. DELTA-1: minors handling promoted from "privacy-policy line" to IN-scope feature (DPDP §9).
2. Schema: + users.dateOfBirth/isMinor/trackingConsent/consentState, + ParentalConsent table, + migration-0003 seam.
3. API: + parental-consent endpoints, + consent gating (403 CONSENT_REQUIRED), + data-export/delete, + parent-confirm seam.
4. UI: + DOB capture, consent-pending screen, parent-verify page, minors analytics notice, checkout parent variant (pending).
5. TRD: single-token auth finalized (shared jose verifySession); tokenVersion via Redis ≤60s cache (DELTA-3); minors data-flow section.
6. Rules: no-analytics-for-minors enforced via single track() wrapper; consent tokens hashed at rest; isMinor never client-set.
7. Plan: Phase 1 6→8 days; buffer 9→7; 70 days / 14 weeks HOLDS; Wk2 = one three-in-one founder conversation (GST+refund+minors).
8. KYC guide: minors/purchaser-of-record note (no KYC impact); submission-ownership clarification.
9. Testing: consent lifecycle + minor-gating matrix made mandatory unit tests; consent E2E added to Phase 7 gate.
10. No locked decision from the audit was re-opened. Buyer-of-record fields intentionally NOT in base schema until Wk2 decision.

## B. Top-3 remaining risks (per persona, blunt)
**A (architect):**
1. Founder Wk2 conversation slips → consent + checkout fields get built twice; the 2 floating buffer days evaporate first.
2. KYC rejection loop (name mismatch across docs) burning the Wk1–6 window — track every 2 days, not weekly.
3. The track()-wrapper discipline eroding mid-project under deadline pressure ("just one direct gtag call") — the rule dies quietly, compliance dies with it.
**B (solo dev):**
1. The auth Week-1 spike failing slowly instead of failing fast — Day-3 Clerk trigger exists; honor it even after 2 days of sunk effort.
2. Content arriving as "almost ready" at Wk4 — placeholders are fine, but Phase 7 needs REAL videos for the 3G/QA pass; that dependency is Wk4 in name only.
3. Scope creep wearing the disguise of "small asks" — each one is small; together they're the 16-week version. The 24h-written-impact rule is the only defense.

## C. FINALIZED — Week 1 (day-by-day)
- **Day 1:** GitHub org + `codeascend-platform` private repo + org-wide 2FA + branch protection on main; commit this pack to /docs; send founder: A1 (live-class scope), A2 (timeline), entity question, KYC kickoff per guide §Step 0
- **Day 2:** Toolchain + accounts (Neon, Upstash, Vercel, Render, Cloudflare, Sentry — org identity, founder billing); Google OAuth dev client; Resend test send works
- **Day 3:** Monorepo scaffold: pnpm workspaces, /web /api /packages/{shared-types,auth,analytics}, TS strict, ESLint + dependency-cruiser, GitHub Actions CI (lint/typecheck/test)
- **Day 4:** Prisma init + FULL v2.0 schema + migration incl. raw-SQL partial index + pg_trgm; seed skeleton; Neon branch workflow proven with one throwaway branch
- **Day 5:** Sentry wired (web+api); /health; env/secrets convention doc; Wk1 gate check → **GATE: boots in 1 cmd, CI green, migration clean** → Friday founder update (what shipped, what's blocked on him)

## D. FINALIZED — Week 2 (day-by-day)
- **Day 1–3 (auth spike):** NextAuth Credentials+Google; split Edge/Node config; shared jose verifySession + Redis tv-cache; cross-system logout; account-linking collision UX; minor-gating middleware. **Day 3 EOD: go/no-go — Clerk fallback if not fully green**
- **Day 4:** DOB-required signup + isMinor derivation + consentState + tracking-consent checkbox; rate-limiter middleware on /auth/* (Redis); email verification send
- **Day 5:** Parental-consent request/verify endpoints + parent email template + consent-pending gating (learn/checkout/live blocked, browse allowed); unit tests: token lifecycle (issue/verify/expiry/replay/single-use) + gating matrix; **hold the Wk2 three-in-one founder conversation (GST + refund policy + minors posture) with written record** → **GATE: both signup paths + consent flow + guards + rate limits green in CI** → Friday update

Later weeks stay gated per `07-execution-plan.md` §4 — no further task lists are finalized until each week's gate passes.
