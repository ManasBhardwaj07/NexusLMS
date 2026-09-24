# CODEASCEND — KICKOFF STATUS SHEET (one page) — v2.0 FINAL
**Docs FINAL v2.0 · Week-1/2 tasks finalized · Build start conditional on sign-offs below**

## ✅ LOCKED (change = written change-control per rules §10)
- Stack: Next.js 14 · Express · Neon + Prisma · Upstash Redis + BullMQ · Vercel + Render · Cloudflare Stream · Razorpay · Resend · Sentry
- Timeline: 70 working days / 14 weeks (buffer now 7 days — see changelog: minors feature absorbed 2 buffer days)
- Live classes v1 = unlisted YouTube Live + manual same-day VOD ingest (SDK = v1.1, Wk9 decision gate)
- Auth: single NextAuth JWT (jose, shared verify) + tokenVersion revocation via ≤60s Redis cache (never per-request DB hit)
- Payments: webhook = source of truth, idempotent by design, failure-mode-tested DoD
- Data: paise-only, UTC, append-only payments, one ACTIVE enrollment per (user, course)
- **Minors handling IN v1 scope** (DPDP §9): DOB capture, verifiable parental consent before account usable, analytics OFF for minors

## 🟡 PENDING DISCUSSION (needs founder's written word)
1. Live-class scope change — send audit Appendix A1, approve/reject
2. Timeline acknowledgment — send audit Appendix A2 (milestone-framed)
3. **Wk2 three-in-one decisions: GST treatment · refund policy · minor-user posture (incl. purchaser-of-record)** — one conversation, one written record
4. Brand palette (CodeAscend navy/gold vs QAVYRN) — blocks UI tokens
5. Visible watermark (student email on player) — confirm acceptable

## 🔴 FOUNDER-DEPENDENT (late by X → impact Y)
| Item | Due | Impact if late |
|---|---|---|
| Razorpay account + KYC submitted (founder = applicant, you're team member) | Wk1 | Live-Mode cutover (Wk13) slips 1:1 — #1 schedule risk |
| Domain + Cloudflare + DNS access | Wk1 | Email auth/warm-up/SEO blocked; slips everything comms-related |
| YouTube channel, live streaming enabled | Wk1–2 | 24h activation wait can silently kill Wk9 dry-run |
| Entity question: is QAVYRN registered? Certificate if yes | Wk1 | Determines KYC business type; sole-prop = founder personal liability — his informed call |
| GST + refund policy + minors posture (three-in-one) | Wk2 | Checkout fields + consent flow built twice if late |
| Course content (~80h video + syllabus) | Wk4 | Placeholders seed on time; real-content QA + launch slip |
| Mentor confirmed for dry-run | Wk9 | Phase 5 gate fails |
| Legal page text + invoice format sign-off | Wk12 | Hard launch blocker |

## 🏁 DAY-1 CHECKLIST (yours, no founder input)
- [ ] GitHub org (new, not personal) · founder + you as Owners · **org-wide 2FA required** · private repo
      `codeascend-platform` · branch protection on `main` (PR + CI) · this pack committed under `/docs`
- [ ] Toolchain: Node LTS, pnpm, Docker Desktop, GitHub CLI
- [ ] Org accounts (free tiers; founder = billing owner, you = member): Neon, Upstash, Vercel, Render, Cloudflare, Sentry
- [ ] Google Cloud OAuth client (dev) · Resend test-domain sending verified
- [ ] Execute `10-changelog-and-launch.md` Week-1 task list only

## ⚖️ LEGAL — DAY-1 (founder's plate; your job is forcing the questions)
1. **Entity:** offer letter says "QAVYRN" — registered or not? If not, KYC runs as founder's sole proprietorship
   (personal liability, income in his hands). Ask for the certificate this week — due diligence, not hostility.
2. **GST:** recorded online courses = taxable services; CA needed for registration + SAC code. Due Wk2.
3. **DPDP + minors:** audience skews 16–18 → DPDP §9 verifiable parental consent is a real feature (built Wk2–3);
   tracking/behavioral monitoring banned for minors (enforced in code). Minors also generally can't be bound by
   contract → **purchaser-of-record question** (parent as buyer?) goes to the CA, Wk2.
4. **Invoices:** tax-compliant invoice per paid order; format sign-off Wk12.
5. **Your protection (parallel, non-negotiable):** payroll checkpoint 1–5 Oct; weekly written founder updates;
   this pack + offer letter in your private archive = evidence trail for month-3 review and interviews.

## 📋 Achievement Log
*Running record — update every Friday; feeds the founder update.*

**24 Sep 2026:**
- Repo live, branch protection + CI enforced, planning pack committed.
- Restored repo to exact Day-1 state (docs/ pack, skeleton dirs, bootstrap CI, NO code).
- Updated CODEOWNERS with real founder GitHub handle (@suryansh).
- Drafted Founder Pack messages F-1 to F-4 for review.
- Applied v2.1 schema fixes (tokenHash, actorType, relatedOrderId, usedCount annotation).
- Repo finalization: 6 files removed/merged/archived, docs at 11-file cap, structure locked.

**Next action:** Week 1 Day 2 — toolchain + accounts, OAuth client, Resend test send.
