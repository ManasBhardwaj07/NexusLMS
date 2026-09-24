# 06 — Engineering Rules & Standards v2.0 FINAL
*v1.0 unchanged; v2.0 additions marked [NEW]. CI enforces what it can; review enforces the rest.*

## 1. Repo — v1.0 (monorepo: /web /api /packages/shared-types /packages/auth **[NEW: + /packages/analytics]** /docs /prisma; path-based CI)
## 2. Git & PRs — v1.0 (conventional commits; PR = What/Why/How-tested; no direct main pushes)
## 3. Code standards — v1.0 (strict TS; modules/{routes,controller,service,repository}; zod at boundaries; pino; paise; UTC)
## 4. Security baseline — v1.0 (rate limits day-1; helmet; CORS allowlist; bcrypt(12); webhook sig verify; npm audit in CI)
**[NEW] tokenVersion revocation:** Redis key `tv:{uid}` TTL ≤60s; every bump deletes the key in the same
operation; shared verifySession() in /packages/auth is the ONLY session-verification path (lint-enforced:
no direct jose usage in app code).
## 5. Testing — v1.0 + **[NEW] mandatory unit tests:** parental-consent token lifecycle (issue/verify/expiry/
replay/single-use), minor-gating middleware matrix (PENDING vs VERIFIED × learn/checkout/live), track() no-op for minors.
## 6. DoD — v1.0 (gate + CI green + runbooks + Friday update + achievement log)
## 7. Environments & data — v1.0 + **[NEW] no production PII in staging seeds; consent rows never seeded with real identities**
## 8. Runbooks — v1.0 + **[NEW] minors-data-request (parent deletion/export handling)**
## 9. Never-do list — v1.0 (9 items) + **[NEW] never accept isMinor/consentState from clients (server-derived only);
never fire analytics outside track(); never store parent verification tokens unhashed-at-rest beyond their 48h life
(tokens hashed in DB, plaintext only in the emailed link)**
## 10. Scope freeze & change control — v1.0 verbatim (3 legitimate breaks; v2 backlog default; 24h written impact replies)

## 11. Living Rules Protocol [NEW]
Rules must grow with every feature, or they die.
- **PR Rules Delta:** Every feature/fix PR must include a "Rules" section answering: what new invariant does this code create? Add it to this file or the PR template Step 0 checklist (or justify none).
- **Runbooks:** Every new integration (3rd-party SDK, provider) must add a short runbook stub in `docs/runbooks/`.
- **Quarterly Audit:** Run `/skills/product-readiness-audit` against the whole platform quarterly (or at Phase 7).
- **Placement Law:** Executable artifacts (schema, configs, workflows, skills) live in functional folders (`prisma/`, `.github/`, `skills/`, `web/`, `api/`, `packages/`); `docs/` holds prose/decisions/plans ONLY and never duplicates code. One README per directory with distinct purpose. Root max 6 entries.
- **Git Status:** `git status` must be clean before any PR.
- **Folder README rule:** A folder gets a README only if it explains something not covered by the root README or the docs pack. Empty skeleton folders never get READMEs. If a folder's contents become self-explanatory or its explanation moves into code/docs, the README gets deleted, not updated forever.
- **Pointer-file rule:** A pointer file (a `.md` whose only purpose is linking to another file) must stay under ~10 lines. If it grows past that, it has become a second source of truth that can drift — treat any oversized pointer file as a bug; merge its content into the target file instead.
- **`.gitkeep` expiry:** A `.gitkeep`-only folder is acceptable only *before* that folder's phase has started. Past the phase gate, an empty skeleton is a missing-work signal — don't let it sit unquestioned.
