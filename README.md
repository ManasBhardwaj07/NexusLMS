# CodeAscend Platform

Full-stack course platform — catalog browsing, Razorpay checkout, recorded video delivery via Cloudflare Stream, and live classes via YouTube Live.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| API | Express (modular: routes / controller / service / repository) |
| Database | Neon Postgres + Prisma ORM |
| Cache & Queues | Upstash Redis + BullMQ |
| Payments | Razorpay (webhook as source of truth, idempotent) |
| Video | Cloudflare Stream (recorded), YouTube Live (live classes) |
| Email | Resend |
| Monitoring | Sentry |
| Hosting | Vercel (frontend) + Render (API) |

## Getting Started

```bash
corepack enable
pnpm install
pnpm dev
```

Requires Node 20 LTS. Database migrations require Neon credentials in `.env`.

## Repository Structure

```
web/                  Next.js frontend
api/                  Express API server
packages/
  shared-types/       Types shared between web and api
  auth/               Single session-verification path (jose + Redis)
  analytics/          Single track() wrapper (no-ops for minors)
prisma/               Schema, migrations, seed
docs/                 Planning pack and architecture decisions
scripts/              CI and build scripts
.github/              Workflows, PR template, CODEOWNERS
```

## Development Rules

- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- All changes go through PRs — branch protection enforces CI
- Money stored as integer paise, never floats
- All timestamps in UTC
- Payment tables are append-only
- Never commit secrets or `.env` files
- Full rules in `docs/06-engineering-rules.md`

## Timeline

15-week solo build. Current status tracked in `docs/07-execution-plan.md`.
