# REPO-STATE — Current State of `codeascend-platform`
**Date:** 24 Sep 2026 · **State:** pre-code base, planning-committed, consistent with docs pack v2.0 FINAL
**This file:** what the repo contains, why it's safe, what must never enter it, and how to proceed.

## 1. Current contents (complete file map)
codeascend-platform/
├── README.md                    Project identity, stack, layout, rules pointer
├── .gitignore                   Blocks .env*, node_modules, builds, logs, OS files
├── .editorconfig                LF, UTF-8, 2-space (enforced by editors, zero setup)
├── CODEOWNERS                   Review required from founder + Manas (⚠️ placeholder usernames — fix in first PR)
├── .github/
│   ├── workflows/ci.yml         Bootstrap CI (docs-sanity, always green until Day-3 toolchain lands)
│   ├── PULL_REQUEST_TEMPLATE.md Forces What/Why/How-tested/Risk/Achievement-log
│   ├── dependabot.yml           Weekly npm updates, max 3 open PRs
│   └── ISSUE_TEMPLATE/
│       ├── bug.md               Includes payments-path STOP rule (docs/06 §5)
│       └── feature.md           Forces v1-freeze check + timeline delta (scope-creep defense)
├── docs/                        The FULL v2.0 FINAL planning pack (13 files — MASTER.md first)
├── web/                         (empty — .gitkeep) FE lands Week 1 Day 3
├── api/                         (empty — .gitkeep) BE lands Week 1 Day 3
├── packages/
│   ├── README.md                Why auth/analytics must be the only paths
│   ├── shared-types/.gitkeep    Types land Day 3
│   ├── auth/.gitkeep            Session-verify package lands Week 2
│   └── analytics/.gitkeep       track() wrapper lands Week 2
└── prisma/
    └── README.md                Schema lands Day 4 per docs/03-database.md

## 2. Safety & compliance check (verified against the locked decisions)
| Check | Result |
|---|---|
| Secrets/keys in repo | NONE — scanned; `.env*` hard-blocked by .gitignore |
| Money-as-float anywhere | N/A — no code yet; schema (docs/03-database.md) uses integer paise |
| CI status | Green by design (bootstrap) — real lint/typecheck/test land Day 3 per plan |
| Naming | Matches locked decisions: web/api/packages/prisma monorepo, codeascend-platform repo name |
| Docs ↔ decisions traceable | MASTER Part 2 lists the 10 locked decisions; each detailed doc implements them (see §4) |
| PII / employment docs in repo | NONE — offer letter, resume, Decision Audit v1.1 stay in your private archive (§3) |
| Binaries / videos | NONE — video content never enters git; it goes to Cloudflare Stream |

## 3. What must NEVER enter this repo
- .env, .env.*, any secret (Razorpay keys, JWT secret, DB URLs) — platform secret stores only
- node_modules/, build output (.next/, dist/, coverage/) — gitignored, but never force-add
- Offer letter, your resume, Decision Audit v1.1 (contains comp/risk context) — private archive, not repo
- Real user PII, real consent data, real identities in seeds — seed data is synthetic only (prisma/schema-notes.md)
- Course videos/PDFs — Stream/R2 only; git is for code, never content

## 4. Traceability: repo artifact → locked decision
| Artifact | Implements |
|---|---|
| Monorepo layout | Decision 1 (stack), Decision Register 1.9 (repo shape) |
| docs/ pack | Decisions 2–10 (timeline, scope, auth, payments, video, data rules, minors, topology, legal posture) |
| Bootstrap CI + PR template + issue templates | docs/06 rules (git flow, testing discipline, freeze control) |
| dependabot.yml | docs/06 §4 (npm audit in CI) |
| .gitignore | docs/06 §9 never-do list (secrets) |

## 5. Known placeholders (fix before/within first PR)
- CODEOWNERS: replace @FOUNDER_GITHUB_USERNAME with Suryansh's real handle

## 6. Push sequence (once repo access lands)
1. git init in the extracted folder (or clone the empty repo and copy contents in) → commit as
   "chore: initial commit — monorepo base + planning pack v2.0" directly to main (initial commit
   doesn't need PR; every commit after this does)
2. Set remote → push
3. Repo Settings → Branches → protect main: require PR, require ci/bootstrap check, 1 approving review, no force pushes
4. First real PR: chore: real codeowners — proves the whole PR+CI flow end-to-end
5. Log achievement: "Repo live, branch protection + CI enforced, planning pack committed" (dated)

## 7. What is deliberately ABSENT right now (and when it lands)
No package.json, no app code, no Prisma schema file in-repo — by design. Week 1 is execution-gated:
scaffold Day 3, schema Day 4 (from docs/03-database.md), Sentry/env Day 5. Committing half-finished scaffold before
the gate would violate the plan's own discipline. The repo being "docs + skeleton + green CI" IS the
correct Day-1 state.
