# CodeAscend Platform — Planning & Requirements Pack
## VERSION 2.0 — FINAL
**Date:** 23 Sep 2026 · **Authors:** Senior Staff Architect (A) + SDE-3 Solo Delivery (B), joint
**Basis:** Decision Audit v1.1 (normative rationale) + challenge-round + review deltas DELTA-1..4
**Status:** FINAL. Change control per `06-engineering-rules.md` §10. Only Week-1/Week-2 tasks are
finalized (in `10-changelog-and-launch.md`); later weeks stay gated per `07-execution-plan.md` §4.

## Contents
| File | What it is |
|---|---|
| `00-kickoff-status.md` | One-page status: locked / pending / founder-dependent / day-1 / legal |
| `01-prd.md` | Product requirements: frozen v1 scope (minors handling IN scope), stories, NFRs |
| `02-architecture-trd.md` | System architecture: topology, auth, payments, video, live, minors data-flow |
| `03-database-schema.prisma` + notes | Full data model v2.0 |
| `04-api-contract.md` | Every endpoint, auth, idempotency, errors |
| `05-uiux-spec.md` | Pages, components, states, tokens, minors screens |
| `06-engineering-rules.md` | Code/git/test/security/freeze rules incl. minors-analytics + tokenVersion cache |
| `07-execution-plan.md` | Week 1–14, gates, founder deps, buffer accounting |
| `08-razorpay-kyc-guide.md` | Founder-executed KYC walkthrough |
| `09-blind-spot-review.md` | Gap record + external reviewer checklist |
| `10-changelog-and-launch.md` | v1.0→v2.0 changelog, per-persona top-3 risks, FINAL Wk1+Wk2 day-by-day tasks |

## Founder sign-offs required (in writing)
1. **Wk1:** Timeline acknowledgment (milestone-framed message, audit Appendix A2)
2. **Wk1:** Live-class scope change (audit Appendix A1) — approval or rejection (rejection → 16-week plan)
3. **Wk1:** Razorpay KYC submission proof + entity question answered (registration certificate if QAVYRN is a company)
4. **Wk2:** Three-in-one decision conversation: **GST treatment + refund policy + minor-user posture
   (age-gate + parental-consent + purchaser-of-record)** — one meeting, written record
5. **Wk1:** Domain + Cloudflare live · YouTube channel live-enabled · DNS access granted

## ⚡ START HERE
**`MASTER.md`** — the entire pack consolidated into one self-contained file, including the Founder Pack (every item to raise with Suryansh, with the ask and the cost of lateness). Individual files remain the detailed references; MASTER wins on any conflict.
