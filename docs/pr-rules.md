# PR Pre-Flight Gate

This checklist is mandatory before opening any Pull Request.
**Gate philosophy:** fast for small docs PRs, strict for anything touching `api/`, `prisma/`, or payments.

### Mandatory for ALL PRs:
- [ ] **Scope check:** Is this in the v1 freeze? If not: move to v2 backlog or require written founder timeline re-quote.
- [ ] **Secrets scan:** Ensure no `.env`, keys, tokens, or PII are checked in (review git diff).
- [ ] **Achievement-log:** One line written for the Friday update in the achievement log.

### Mandatory for API / PRISMA / PAYMENTS PRs:
- [ ] **Tests:** New logic has tests. Payment-path changes *must* include regression tests (per docs/06 §5).
- [ ] **Idempotency:** Any new write path names its idempotency anchor (schema-level or header-level).
- [ ] **Money/dates:** Paise ints only. UTC only.
- [ ] **Rules delta:** Answer the question: what new invariant does this code create? Add it to `docs/06-engineering-rules.md` or this PR-RULES gate (or justify none).
