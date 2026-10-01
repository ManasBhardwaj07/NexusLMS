# CodeAscend Platform

Full-stack course platform — catalog browsing, Razorpay checkout, recorded video delivery via Cloudflare Stream, and live classes via YouTube Live. Built with strict DPDP Act §9 compliance: age verification, minor access gating, and verifiable parental consent.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, TypeScript, Tailwind CSS) |
| API | Express (modular: routes / controller / service / prisma) |
| Database | Neon Postgres + Prisma ORM (pooled runtime, unpooled migrations) |
| Cache & Rate Limiting | Upstash Redis (sliding-window ZSET, session revocation) |
| Auth & Sessions | Auth.js / NextAuth (JWE Compact, HKDF-derived keys, Edge-safe) |
| Minors & Consent | DPDP §9 verifiable parental consent (SHA-256 tokens, real-time unlock) |
| Payments | Razorpay (webhook as source of truth, idempotent) |
| Video | Cloudflare Stream (recorded), YouTube Live (live classes) |
| Email | Resend |
| Monitoring | Sentry (web + api) |
| Quality Gates | clean-room type isolation, dependency-cruiser, toolchain delta |

## Getting Started

```bash
corepack enable
pnpm install
pnpm dev
```

Run the mandatory quality gate before committing:
```bash
pnpm gate
```

Requires Node 20 LTS. Copy `.env.example` to `.env` and supply database credentials, Upstash Redis keys, and auth secrets.

## Repository Structure

```
web/                  Next.js frontend (Next.js 15 App Router)
api/                  Express API server (modular architecture, auth & consent)
packages/
  auth/               Edge-safe session verification & Upstash Redis cache helpers
prisma/               Prisma schema (v2.1 DPDP compliant) & migrations
docs/                 8-file architecture and engineering pack (strictly capped)
scripts/              CI gates (placement, clean-room, toolchain delta, docs sanity)
.github/              Workflows, PR template, CODEOWNERS
```

## Development Rules

- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- All changes go through PRs — branch protection enforces CI gates (`pnpm gate`)
- Money is ALWAYS stored as integer paise, never floats
- All timestamps in UTC
- Payment tables are append-only
- Strict clean-room type isolation and zero credential leaks
- Full guidelines in `docs/06-engineering-rules.md`

## Timeline & Milestones

14-week execution plan. Current progress tracked in [`docs/07-execution-plan.md`](docs/07-execution-plan.md).
