# CodeAscend Platform
Course-selling + delivery web platform (catalog → Razorpay checkout → recorded + live classes).

**Status:** pre-build. Planning pack is FINAL — start at `docs/MASTER.md`.
**Stack:** Next.js 14 · Express · Neon Postgres + Prisma · Upstash Redis + BullMQ · Vercel + Render · Cloudflare Stream · Razorpay · Resend

## Quick start ( Week 1 fills this in )
1. `corepack enable && pnpm install` (Node 20 LTS)
2. `pnpm dev` — boots web + api together
3. `pnpm db:migrate` — Prisma migrate against a Neon branch

## Layout
| Path | What lives here |
|---|---|
| `/web` | Next.js 14 app (App Router, TS, Tailwind) |
| `/api` | Express API (modules/{routes,controller,service,repository}) |
| `/packages/shared-types` | Types shared web ↔ api (Course, Order, Enrollment…) |
| `/packages/auth` | The ONE session-verification path (jose verifySession + Redis tv-cache) |
| `/packages/analytics` | The ONE track() wrapper (no-ops for minors / no consent) |
| `/prisma` | Schema + migrations + seed |
| `/docs` | The full planning pack (MASTER.md = single source) |

## Rules
Conventional commits · PRs only (branch protection enforces CI) · money = integer paise ·
timestamps UTC · payment tables append-only · never commit secrets · scope freeze per `docs/06-engineering-rules.md`.
