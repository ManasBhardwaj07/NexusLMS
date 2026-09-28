---
name: security
description: Security point-of-view and vulnerability review principles.
invoking_gate: PR gate (api/prisma changes)
---

# Security Point of View

This skill defines the mindset required when evaluating or writing code for security.

1. **Adversarial Validation:** Do not assume code is safe because it uses a framework. Assume it is vulnerable until proven otherwise.
2. **Impact-Driven Severity:** A vulnerability requires a concrete affected principal, resource, or security outcome. A deviation from a checklist is not a vulnerability; an actual boundary failure is.
3. **Defense-in-Depth:** If Layer A prevents the attack, the absence of Layer B is a hardening note, not a critical vulnerability.
4. **Source-First:** Find vulnerabilities that violate a real trust boundary, then provide the exact source evidence and the smallest effective fix.
