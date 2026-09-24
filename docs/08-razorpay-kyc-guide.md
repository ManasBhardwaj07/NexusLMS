# 08 — Razorpay KYC Guide v2.0
*v1.1 carried forward intact; v2.0 adds the minors/purchaser-of-record note and one clarification.
Everything else — business-type decision, document checklist, sequence, rejection causes, hard rules — unchanged.*

## [NEW v2.0] Minors & purchaser-of-record (does NOT change KYC itself)
- KYC verifies the BUSINESS collecting money. Whether a 16-year-old's parent confirms at checkout is a
  product/legal layer decision (Wk2 founder+CA) — it does not affect which documents Razorpay needs.
- If purchaser-of-record = parent: checkout collects parent name + relationship + confirmation
  (migration 0003 fields, config-flagged). Razorpay still settles to the business account.
- Declare honest, low expected volume — a brand-new edtech with zero history declaring high volume is a
  rejection cause, not an aspiration.

## [Clarification v2.0] Who clicks "submit"
The founder — as account owner — submits KYC and responds to Razorpay queries. You never hold the login
during KYC review; you're added as team member AFTER approval (developer role, Test keys for all dev work).

## Unchanged from v1.1
Step 0 business-type decision (sole prop vs company; Udyam as free business proof; sole prop = founder's
personal liability — his informed, CA-advised call) · collect-before-you-apply checklist (PAN, address proof,
bank + cheque, website URL, phone/email, honest volume) · sequence (signup → KYC → 2–7 working days →
Live keys into Render prod secret store only → add dev as team member) · rejection causes (name mismatch,
blurry docs, address mismatch, unreachable site, inflated volume) · escalation triggers (not submitted end
of Wk1 → written flag; not approved end of Wk6 → Live cutover slips 1:1) · webhooks setup for Test Mode Wk5–6.
