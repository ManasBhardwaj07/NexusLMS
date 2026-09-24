## Step 0: PR Pre-Flight Gate
<!-- Check off the mandatory items per docs/pr-rules.md -->
- [ ] Scope check: Inside v1 freeze, or added to v2 backlog / written founder requote.
- [ ] Secrets scan: No .env, keys, tokens, PII.
- [ ] Achievement-log line added.
<!-- If touching api/ prisma/ payments: -->
- [ ] Tests: New logic tested + regression tests for payment paths.
- [ ] Idempotency: Write path anchors named.
- [ ] Money/dates: Paise ints, UTC.

## What
<!-- one line -->

## Why
<!-- which user story / decision / gap this serves -->

## How tested
<!-- commands run + what you verified -->

## Risk
<!-- payments path? data model? none? -->

## Rules Delta
<!-- What new invariant does this code create? Did you add it to docs/06-engineering-rules.md or pr-rules.md? If no new rule, justify why. -->

## Achievement-log line
<!-- dated, factual — feeds the Friday founder update -->
