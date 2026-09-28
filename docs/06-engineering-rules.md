# 06 — Engineering Rules & Standards v2.0 FINAL
*v1.0 unchanged; v2.0 additions marked [NEW]. CI enforces what it can; review enforces the rest.*

## 1. Repo — v1.0 (monorepo: /web /api /packages/shared-types /packages/auth **[NEW: + /packages/analytics]** /docs /prisma; path-based CI)
## 2. Git & PRs — v1.0 + [NEW] branch naming and commit rules

**Branch naming (industry standard):** `<type>/<short-desc>`
Types: `feature/`, `bugfix/` (or `fix/`), `chore/`, `docs/`, `refactor/`.
Examples: `feature/parental-consent`, `bugfix/webhook-replay`, `chore/github-actions`.
Never use generic names like `test`, `update`, or `temp`.

**Commit messages (hard convention):** Short and precise. Prefix required:
- `feat:` — new user-facing or backend functionality
- `fix:` — resolves a defect or unintended behavior
- `chore:` — CI, scripts, linting, dependencies, repo hygiene
- `docs:` — planning pack, guides, or inline documentation

Examples: `feat: add DOB field to signup form`, `fix: webhook replay dedup`.
Keep to 1-2 lines normally. Up to 3-4 lines is allowed ONLY for major architectural changes where context is critical. Otherwise, long explanations go in the PR description, not the commit.

**PRs:** PR = What/Why/How-tested (per template). No direct pushes to `main`. Squash merge to keep `main` history clean.
## 3. Code standards — v1.0 (strict TS; modules/{routes,controller,service,repository}; zod at boundaries; pino; paise; UTC)
**[NEW] Code Comments Rule:** Strict minimalist commenting. No commenting on the obvious. Comments must be short, precise, and to the point.
- **Criteria for inclusion:** Only comment *why* something is done if it's a non-obvious business rule, a hack for a known bug, or a complex algorithmic decision.
- **Never:** Never write a comment and then another comment right after (no chained/redundant comments). Never comment *what* the code is doing (the code itself should explain what it does).
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
- **Quarterly Audit:** Run `/skills/product-readiness-audit/SKILL.md` (checklist mirror: `09-blind-spot-review.md` Part B) quarterly or at Phase 7.
- **Skills Cap Rule:** `skills/` holds only skills invoked by a gate or phase (current: 1). A new skill requires naming the gate that invokes it.
- **Placement Law:** Executable artifacts (schema, configs, workflows) live in functional folders (`prisma/`, `.github/`, `web/`, `api/`, `packages/`); `docs/` holds prose/decisions/plans ONLY and never duplicates code. Root = prose/config max 3 (`README.md`, `.gitignore`, `.editorconfig`) + functional workspace dirs.
- **Git Status:** `git status` must be clean before any PR.
- **Folder README rule:** A folder gets a README only if it explains something not covered by the root README or the docs pack. Empty skeleton folders never get READMEs. If a folder's contents become self-explanatory, the README gets deleted, not updated forever.
- **Pointer-file rule:** A pointer file (a `.md` whose only purpose is linking to another file) must stay under ~10 lines. If it grows past that, merge its content into the target file.
- **`.gitkeep` expiry:** A `.gitkeep`-only folder is acceptable only *before* that folder's phase has started. Past the phase gate, an empty skeleton is a missing-work signal.
- **No new file for a structural decision:** When a new invariant, process rule, or state record is created — add a section to the existing file that owns that topic. A new file is only justified if no existing file owns the topic AND the content would be orphaned if merged. When in doubt: section, not file.
- **docs/ cap:** `docs/` is capped at 11 files — one-in-one-out, no exceptions without amending this rule.

## 12. Phase 0–1 Configuration Baselines [NEW]
These configuration decisions must be enforced as we build out the MVP to prevent rediscovering issues under load:
1. **Database:** Neon `DATABASE_URL` must use the pooled (`-pooler`) endpoint starting from the first migration.
2. **Performance:** Catalog/course-detail pages must be cached (ISR or edge-cache on Vercel), not re-rendered per request.
3. **Rate Limits:** Must be scoped per-user/IP, not global.
4. **Workers:** BullMQ workers must have an explicit concurrency setting, not rely on the default.
5. **Tooling & CLI Version Pinning:** Never run unversioned `npx <pkg>` commands. All CLI tools must be pinned in `package.json` to exact stable versions (no floating majors, no `^`/`~` on critical tooling, zero pre-release/RC versions).
6. **Migration & CLI Interactive Safety:** Interactive inputs (e.g. `y`, `yes`, or arbitrary keystrokes) must NEVER be piped blindly into CLI prompts. If a migration or CLI command prompts unexpectedly for naming or drift consent, immediately abort, inspect the drift via `git diff` or database query, and resolve root cause before proceeding.
7. **Schema & Migration Pre-flight:** Before executing migrations, validate the schema with `npx prisma validate` and `npx prisma format`. Raw SQL migrations must strictly adhere to the Minimalist Commenting Rule (§3: comment only non-obvious business invariants, never comment what the SQL syntax does).
8. **Config & Env Integrity:** `.env` and `.env.*` files must be verified for syntax (balanced quotes, valid connection strings) before executing commands that load them.
