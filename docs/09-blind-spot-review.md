# 09 — Blind-Spot Review v2.0
## Part A — Gap record
All v1.0–v2.0 gaps patched; fixes live in `prisma/schema.prisma` (actorType, tokenHash, relatedOrderId), `prisma/schema-notes.md` v2.1, and `docs/06-engineering-rules.md` §9/§11.

## Part B — Remaining checklist for the external reviewer
- [ ] Walk the 5 flows as user / attacker / Razorpay-retry-logic against `02-architecture-trd.md`
- [ ] Name the idempotency anchor of every write path (payments: razorpayPaymentId + webhook_events + Idempotency-Key;
      progress: @@unique; consent: single-use token; enrollment: partial unique index)
- [ ] Cross-check every UI screen in `05-uiux-spec.md` against `04-api-contract.md`
- [ ] Confirm no money-as-float anywhere; every admin mutation writes AdminAction
- [ ] Verify every rule in `06` has an enforcement mechanism (CI, lint, or central wrapper)
- [ ] Challenge the 70-day figure bottom-up one more time against the Wk table
- [ ] The honesty test: anything you'd be embarrassed to explain in a month-3 review or interview?
