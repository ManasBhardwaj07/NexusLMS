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
| **next** | 15.5.26 | SAFE-NEAR-TERM | Next 15 upgrade cleared all critical RCEs from the v14 line. |
| **react** / **react-dom** | 19.3.0 | SAFE-NEAR-TERM | Bumped explicitly to satisfy Next.js 15 requirements. |
| **eslint** / **eslint-config-next** | 8.57.1 / 15.5.26 | PLAN-UPGRADE-EVALUATE | eslint 8 kept to avoid Flat Config rewrite blockers; config-next bumped. |
| **prisma** / **@prisma/client** | 5.22.0 | PLAN-UPGRADE-EVALUATE | Stable v5 line. Avoids v6 breaking changes for now. Evaluate v6 config changes before upgrade. |
| **tailwindcss** | 3.4.19 | PLAN-UPGRADE-EVALUATE | Stable 3.x line. Evaluate Tailwind v4 once it is out of alpha. |
| **postcss** | 8.5.28 | PLAN-UPGRADE-EVALUATE | Tied to Tailwind 3. We applied a `pnpm.overrides` to `>=8.5.23` to patch a path-traversal vulnerability. |

*(Note: Next 15.5.26 + React 19.3.0 adopted 29 Sep via protocol run; RCE-class CVEs cleared, resolving the prior Next 14 vulnerability).*
