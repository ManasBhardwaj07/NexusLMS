# TOOLCHAIN REGISTRY (The Known-Good Set)
**Single Source of Truth.** No version listed here may be changed without an atomic PR updating this file, `package.json`, `.nvmrc`, and the lockfile, alongside explicit human approval documenting the compatibility impact.

## How to Verify This Document
This document is the **single source of truth** for the toolchain. To verify this matrix against reality:
1. Run `pnpm ls -r --depth 0` to see exactly what is resolved in the workspace.
2. Run `npm view <package> versions` or `npm view <package> deprecated` to check the registry status.
3. Run `pnpm audit` to verify security health.

## The Compatibility Matrix
*App runtime dependencies (Next, React, Express) keep standard semver ranges (`^`) in `package.json` as their internal trees manage safe updates; the lockfile pins them. Tooling dependencies are pinned EXACT to prevent CI drift.*

| Tool | Locked version | Verdict | Security / EOL Note |
|---|---|---|---|
| **Node.js** | 24 | SAFE-NEAR-TERM | Active LTS; matched to the local environment and required by `dependency-cruiser` 18. |
| **pnpm** | 9.15.9 | SAFE-NEAR-TERM | Explicitly enforces local/CI parity via `packageManager` field. |
| **dependency-cruiser** | 18.4.0 | SAFE-NEAR-TERM | Enforces architectural boundaries; explicitly requires Node 22+. |
| **typescript** | 5.9.3 | SAFE-NEAR-TERM | Stable TS compiler for strict type-checking across workspaces. |
| **tsx** | 4.23.15 | SAFE-NEAR-TERM | Zero-config TypeScript execution for API server dev mode. |
| **express** | 4.22.3 | SAFE-NEAR-TERM | Stable Express 4.x for the API workspace. |
| **@sentry/node** / **@sentry/nextjs** | 11.0.0 | SAFE-NEAR-TERM | Latest stable observability SDK; ESM config compatibility addressed in Week 1. |
| **@types/node**, **@types/react**, **@types/react-dom**, **@types/express** | matches impl. | SAFE-NEAR-TERM | Pinned to match the implementation versions. |
| **@types/node** (runtime Node 24) | 20.19.43 / Node 24 | PLAN-UPGRADE-EVALUATE | Currently types target v20 (20.19.43); evaluate bump once Node 24 types stabilize. @types/node now also in packages/auth (clean-room fix). |
| **@typescript-eslint/parser** | 8.71.0 | SAFE-NEAR-TERM | Pinned parser for TypeScript AST linting in api and packages/auth workspaces. |
| **@typescript-eslint/eslint-plugin** | 8.71.0 | SAFE-NEAR-TERM | Pinned lint rules for TypeScript in api and packages/auth workspaces. |
| **next** | 15.5.26 | SAFE-NEAR-TERM | Next 15 upgrade cleared all critical RCEs from the v14 line. |
| **react** / **react-dom** | 19.3.0 | SAFE-NEAR-TERM | Bumped explicitly to satisfy Next.js 15 requirements. |
| **eslint** / **eslint-config-next** | 8.57.1 / 15.5.26 | PLAN-UPGRADE-EVALUATE | eslint 8 kept to avoid Flat Config rewrite blockers; config-next bumped. |
| **prisma** / **@prisma/client** | 5.22.0 | PLAN-UPGRADE-EVALUATE | Stable v5 line. Avoids v6 breaking changes for now. Evaluate v6 config changes before upgrade. |
| **tailwindcss** | 3.4.19 | PLAN-UPGRADE-EVALUATE | Stable 3.x line. Evaluate Tailwind v4 once it is out of alpha. |
| **postcss** | 8.5.28 | PLAN-UPGRADE-EVALUATE | Tied to Tailwind 3. We applied a `pnpm.overrides` to `>=8.5.23` to patch a path-traversal vulnerability. |
| **next-auth** | 5.0.0-beta.32 | PLAN-UPGRADE-EVALUATE | Auth.js v5 for Next 15 / React 19 App Router; beta line; Clerk fallback is the risk valve. |
| **@auth/prisma-adapter** | ^2.11.3 | SAFE-NEAR-TERM | Prisma adapter for NextAuth v5; peer requirement satisfied: `@prisma/client >=5` (5.22.0). |
| **bcrypt** | ^6.0.0 | SAFE-NEAR-TERM | Password hashing in Node runtime (API and web Credentials path; excluded from Edge middleware). |
| **@types/bcrypt** | 6.0.0 | SAFE-NEAR-TERM | Pinned exact tooling/type definitions matching bcrypt 6.0.0. |
| **jose** | ^6.2.12 | SAFE-NEAR-TERM | Universal Edge/Node portable JWE/JWT decryption for shared `verifySession()`. |
| **@upstash/redis** | ^1.39.0 | SAFE-NEAR-TERM | Serverless REST/HTTP Redis client for token revocation (`tv:{uid}`), metadata cache, and rate limiting. |
| **vitest** | 5.0.2 | SAFE-NEAR-TERM | Fast unit test runner; pinned exact tooling dep; Node engine requirement `^24.0.0` satisfied by Node 24.12.0. |
| **zod** | ^3.24.2 | SAFE-NEAR-TERM | Schema validation at API boundaries; strict TS typing with zero dependencies. |
| **helmet** | ^8.0.0 (8.3.0) | SAFE-NEAR-TERM | Security HTTP headers middleware for API layer; built-in types. |
| **cors** | ^2.8.5 (2.8.6) | SAFE-NEAR-TERM | Cross-origin resource sharing middleware with env-driven allowlist. |
| **@types/cors** | 2.8.19 | SAFE-NEAR-TERM | Pinned exact tooling/type definitions matching cors 2.8.6 in api workspace. |

*(Note: Next 15.5.26 + React 19.3.0 adopted 29 Sep via protocol run; RCE-class CVEs cleared, resolving the prior Next 14 vulnerability).*
