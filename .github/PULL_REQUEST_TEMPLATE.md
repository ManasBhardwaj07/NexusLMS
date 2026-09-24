## 📌 Pull Request Overview

### 1. Type of Change
Select all that apply:
- [ ] 🚀 **New Feature** (adds user-facing or backend functionality)
- [ ] 🐛 **Bug Fix** (resolves a defect or unintended behavior)
- [ ] 📝 **Documentation** (updates to planning pack or guides)
- [ ] 🔧 **Chore / Tooling** (CI, scripts, linting, dependencies)
- [ ] 🔒 **Security / Compliance** (DPDP, auth, rate-limiting, secret management)

### 2. Affected Components
- [ ] `web/` (Next.js frontend)
- [ ] `api/` (Express API)
- [ ] `packages/` (shared-types, auth, analytics)
- [ ] `prisma/` (database schema & migrations)
- [ ] `docs/` or `.github/` (architecture & automation)

---

## 📝 Summary & Rationale

**What was changed:**
> Describe what this PR does in 1–2 clear sentences.

**Why it was changed:**
> Which user story, task, architectural decision, or bug does this address?

---

## 🧪 Testing & Verification

**How was this tested?**
- Commands executed: (e.g., `bash scripts/check-file-placement.sh`, `pnpm test`, `pnpm typecheck`)
- Verification outcome: (e.g., all checks passed locally)

**Risk level:**
- [ ] None / Low (documentation, isolated script, non-critical path)
- [ ] Medium (touches core routes or database reads)
- [ ] High (touches payments, auth revocation, or database migrations)

---

## 🛡️ Step 0: Pre-Flight Safety Gate

**Mandatory for ALL PRs:**
- [ ] **Scope Check:** Within frozen v1 scope? (If not: v2 backlog or written timeline re-quote)
- [ ] **Secrets Scan:** Zero `.env` files, API keys, private tokens, or PII in `git diff`
- [ ] **Achievement Log:** One dated line added to `## Achievement Log` in `docs/00-kickoff-status.md`

**Mandatory for `api/`, `prisma/`, or Payments PRs:**
- [ ] **Automated Tests:** New logic has unit tests; payments include regression tests (`docs/06` §5)
- [ ] **Idempotency Anchor:** Write path names its anchor (`Idempotency-Key`, `providerEventId`, `@@unique`)
- [ ] **Money & Time:** Integer paise only (no float). Strict UTC timestamps only.
- [ ] **Rules Delta:** Did this code introduce a new system invariant? (Documented in `docs/06` §11 or justified none)
