# 10 — Launch Checklist

*Risks: see MASTER.md §12. Changelog: see git log.*

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
