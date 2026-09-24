---
name: product-readiness-audit
version: 1.0
purpose: Audit platform readiness before major releases.
when_to_invoke: "before launch / major release / handoff"
owner: manas
---

# Product Readiness Audit

## Scope
1. Verify CI is green on `main`.
2. Ensure no placeholder values remain in production config.
3. Validate payment paths using Test Mode DoD.
4. Check data privacy compliance (e.g. minors handling per DPDP).
5. Confirm founder approvals (Timeline, Scope, KYC).

## Execution
Run this audit, check off each item, and produce a `readiness-report.md` artifact.
