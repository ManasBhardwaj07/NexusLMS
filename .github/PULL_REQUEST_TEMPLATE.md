## Pull Request

### Type of Change

- [ ] Feature (new user-facing or backend functionality)
- [ ] Bug Fix (resolves a defect or unintended behavior)
- [ ] Documentation (planning pack, guides, or inline docs)
- [ ] Chore (CI, scripts, linting, dependencies)
- [ ] Security / Compliance (DPDP, auth, rate-limiting, secrets)

### Affected Components

- [ ] `web/` — Next.js frontend
- [ ] `api/` — Express API
- [ ] `packages/` — shared-types, auth, analytics
- [ ] `prisma/` — database schema and migrations
- [ ] `docs/` or `.github/` — architecture and automation

---

### Summary

**What:**
<!-- One or two sentences describing what this PR does. -->

**Why:**
<!-- Which user story, task, decision, or bug this addresses. -->

---

### Testing

**How tested:**
<!-- Commands run and what you verified. Example: `pnpm test`, `bash scripts/check-file-placement.sh` -->

**Risk:**

- [ ] Low — documentation, isolated script, non-critical path
- [ ] Medium — touches core routes or database reads
- [ ] High — touches payments, auth revocation, or database migrations

---

### Pre-Flight Checklist

**All PRs:**

- [ ] Within frozen v1 scope (if not: v2 backlog or written timeline re-quote)
- [ ] No `.env` files, API keys, tokens, or PII in `git diff`
- [ ] Achievement log updated in `docs/00-kickoff-status.md`

**API, Prisma, or Payments PRs only:**

- [ ] Unit tests added; payments include regression tests (ref: `docs/06` section 5)
- [ ] Write path names its idempotency anchor (`Idempotency-Key`, `providerEventId`, `@@unique`)
- [ ] Integer paise only (no floats); strict UTC timestamps
- [ ] Rules delta documented in `docs/06` section 11 (or justified: none)
