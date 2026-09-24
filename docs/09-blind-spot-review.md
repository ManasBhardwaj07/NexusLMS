# 09 — Blind-Spot Review v2.0
## Part A — Gap record (everything caught to date, chronologically)
1. v1.0 six: domain@Wk1 mis-dated · YouTube 24h activation · Razorpay account ownership · entity/legal ambiguity ·
   mentor has no v1 UI · email warm-up ownerless → all patched
2. DELTA-1: DPDP minors under-scoped → now a real feature (DOB, parental consent, analytics ban, purchaser-of-record question)
3. DELTA-2: refund-policy decision Wk10 → Wk2 (bundled with GST + minors, one founder conversation)
4. DELTA-3: tokenVersion per-request DB hit → Redis ≤60s cache with immediate invalidation
5. DELTA-4: docs must survive independent review → self-verification pass run at production of v2.0 (results below)
6. Self-verification findings fixed in v2.0: (a) two-token auth smell → single shared jose verifySession;
   (b) coupon usedCount race → redemption rows are the source of truth, count updated in-txn;
   (c) consent tokens at rest → hashed storage, plaintext only in emailed link (48h life);
   (d) minors consent E2E added to Phase 7 gate; (e) seed data now includes a minor + verified-consent account.

## Part B — Remaining checklist for the external reviewer
- [ ] Walk the 5 flows as user / attacker / Razorpay-retry-logic against `02-architecture-trd.md`
- [ ] Name the idempotency anchor of every write path (payments: razorpayPaymentId + webhook_events + Idempotency-Key;
      progress: @@unique; consent: single-use token; enrollment: partial unique index)
- [ ] Cross-check every UI screen in `05-uiux-spec.md` against `04-api-contract.md`
- [ ] Confirm no money-as-float anywhere; every admin mutation writes AdminAction
- [ ] Verify every rule in `06` has an enforcement mechanism (CI, lint, or central wrapper)
- [ ] Challenge the 70-day figure bottom-up one more time against the Wk table
- [ ] The honesty test: anything you'd be embarrassed to explain in a month-3 review or interview?
