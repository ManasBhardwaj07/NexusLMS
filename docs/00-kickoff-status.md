# CODEASCEND — KICKOFF STATUS SHEET (one page) — v2.0 FINAL
**Docs FINAL v2.0 · Week-1/2 tasks finalized · Build start conditional on sign-offs below**

## ✅ LOCKED (change = written change-control per rules §10)
- Stack: Next.js 14 · Express · Neon + Prisma · Upstash Redis + BullMQ · Vercel + Render · Cloudflare Stream · Razorpay · Resend · Sentry
- Timeline: 15 weeks (acknowledging realistic overlap and real-world blockers; 16 weeks acceptable if unforeseen blockers arise).
- Live classes v1 = unlisted YouTube Live + manual same-day VOD ingest (SDK = v1.1, Wk9 decision gate)
- Auth: single NextAuth JWT (jose, shared verify) + tokenVersion revocation via ≤60s Redis cache (never per-request DB hit)
- Payments: webhook = source of truth, idempotent by design, failure-mode-tested DoD
- Data: paise-only, UTC, append-only payments, one ACTIVE enrollment per (user, course)
- **Minors handling IN v1 scope** (DPDP §9): DOB capture, verifiable parental consent before account usable, analytics OFF for minors

## 🟡 PENDING DECISIONS (External)
1. Live-class scope change — unlisted YouTube Live + manual same-day VOD ingest vs full SDK (approval or 16-wk plan)
2. Timeline confirmation — 14 weeks milestone-framed schedule
3. **Wk2 policy decisions: GST treatment · refund policy · minor-user posture (incl. purchaser-of-record)** — one written record
4. Brand palette (CodeAscend navy/gold vs entity palette) — blocks UI tokens
5. Visible watermark (student email on player) — confirm acceptable

## 🔴 EXTERNAL DEPENDENCIES (late by X → impact Y)
| Item | Due | Impact if late |
|---|---|---|
| Razorpay account + approved KYC | In Process | Managed entirely by founder. Live-Mode cutover slips 1:1 if late. |
| Neon DB Account Credentials | Day-1 | Blocked until founder provides company email (developer will not use personal email). |
| Domain + Cloudflare + DNS access | Wk1 | Email auth/warm-up/SEO blocked; slips everything comms-related |
| YouTube channel, live streaming enabled | Wk1–2 | 24h activation wait can silently kill Wk9 dry-run |
| Business entity registration status | Wk1 | Determines KYC business type and liability structure |
| GST + refund policy + minors posture | Wk2 | Checkout fields + consent flow built twice if late |
| Course content (~80h video + syllabus) | Wk4 | Placeholders seed on time; real-content QA + launch slip |
| Mentor confirmed for dry-run | Wk9 | Phase 5 gate fails |
| Legal page text + invoice format sign-off | Wk12 | Hard launch blocker |

## 🏁 DAY-1 CHECKLIST
- [x] GitHub org · 2FA required · private repo `codeascend-platform` · branch protection on `main` (PR + CI) · this pack committed under `/docs`
- [ ] Toolchain: Node LTS, pnpm, Docker Desktop, GitHub CLI
- [ ] Cloud accounts (free tiers): Neon, Upstash, Vercel, Render, Cloudflare, Sentry
- [ ] Google Cloud OAuth client (dev) · Resend test-domain sending verified
- [ ] Execute `10-launch-checklist.md` Week-1 task list only

## ⚖️ LEGAL & COMPLIANCE REQUIREMENTS — DAY-1
1. **Entity:** KYC requires registered entity certificate or sole proprietorship documentation.
2. **GST:** Recorded online courses = taxable services; CA registration + SAC code due Wk2.
3. **DPDP + minors:** Audience skews 16–18 → DPDP §9 verifiable parental consent is a real feature (built Wk2–3);
   tracking/behavioral monitoring banned for minors (enforced in code). Purchaser-of-record posture due Wk2.
4. **Invoices:** Tax-compliant invoice per paid order; format sign-off Wk12.
5. **Operational Records:** Weekly written progress updates; planning pack serves as architectural baseline.

## 📋 Achievement Log
*Running record — update every Friday; feeds the weekly progress update.*

**24 Sep 2026:**
- Repo live, branch protection + CI enforced, planning pack committed.
- Restored repo to exact Day-1 state (docs/ pack, skeleton dirs, bootstrap CI, NO code).
- Configured CODEOWNERS with repo lead and business handles.
- Documented external dependency requirements F-1 to F-4.
- Applied v2.1 schema fixes (tokenHash, actorType, relatedOrderId, usedCount annotation).
- Repo finalization: 6 files removed/merged/archived, docs at 11-file cap, structure locked.
- 24 Sep — skills restored as Phase-7 runbook (full text), real CI gates live (docs cap, placement law, secrets enforced on every PR), branch protection updated. Repo infrastructure complete.

**Next action:** Week 1 Day 2 — toolchain + accounts, OAuth client, Resend test send.
