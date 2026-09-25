## Step 0: PR Pre-Flight Gate
<!-- All items below are mandatory — see docs/06-engineering-rules.md §11 for the rule set. -->

**Mandatory for ALL PRs:**
- [ ] **Scope check:** Inside v1 freeze? If not: v2 backlog or written timeline re-quote.
- [ ] **Secrets scan:** No `.env`, keys, tokens, or PII in `git diff`.
- [ ] **Achievement-log:** One line added to `## Achievement Log` in `docs/00-kickoff-status.md`.

**Mandatory for `api/` / `prisma/` / payments PRs:**
- [ ] **Tests:** New logic has tests; payment-path changes include regression tests (docs/06 §5).
- [ ] **Idempotency:** New write path names its idempotency anchor (schema-level or header-level).
- [ ] **Money/dates:** Paise ints only. UTC only.
- [ ] **Rules delta:** What new invariant does this code create? Add to `docs/06` §11 or justify none.

---

## What
<!-- one line -->

## Why
<!-- which user story / decision / gap this serves -->

## How tested
<!-- commands run + what you verified -->

## Risk
<!-- payments path? data model? none? -->

## Rules Delta
<!-- What new invariant does this code create? Did you add it to docs/06-engineering-rules.md? If none, justify why. -->

## Achievement-log line
<!-- dated, factual — feeds the Friday progress update in docs/00-kickoff-status.md -->