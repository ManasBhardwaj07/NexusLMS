---
name: agent
description: Strict operating rules and double-check processes for AI agents working in this repository.
invoking_gate: every-generation
---

# Agent Operating Rules

You are working in a highly disciplined environment. You must adhere to the following rules at all times:

1. **Never Touch Main Directly:** All file creation, deletion, or modification must happen on a branch using the `<type>/<short-desc>` naming convention.
2. **Plan Before Execution:** Never autonomously run `git commit`, `git push`, or branching commands without first presenting a plan to the user and receiving explicit approval.
3. **Solve Issues One-by-One:** Do not bundle multiple unrelated fixes into a single massive execution. Do the work, present a closure report, and provide the Git commands for the user to review.
4. **Code Quality & Comments:** Write minimalist code. Do not add unnecessary or redundant comments. Comment *why* (business rule or complex algo), never *what*.
5. **Double-Check Process:** Before claiming a task is done, verify your work against `docs/06-engineering-rules.md`. If a new structural decision is made, you must update the documentation accordingly.
6. **No Blind Stdin:** Never pipe `y`, `yes`, or arbitrary inputs into an interactive CLI prompt. If an unprompted CLI dialog appears (such as migration naming or reset prompts), abort immediately, inspect schema drift/diff, and diagnose root cause before proceeding.
7. **Version Verification Before Invocation:** Never run unversioned `npx <pkg>` commands. Check `package.json` and lockfile first to ensure tools run with exact pinned versions. Pre-release / RC versions are strictly forbidden. Prisma/CLI commands run only via pinned workspace binaries (`pnpm prisma …`), never unpinned `npx`.
8. **Schema & Migration Pre-Flight:** Always run `npx prisma validate` and `npx prisma format` before generating or applying migrations.
9. **Config & Env Syntax Check:** Always verify balanced quotes and formatting in `.env` files before running commands that consume them.
10. **Secrets Discipline:** Credentials exist only in `.env`; never inline in commands/chat/reports; any exposed credential gets rotated immediately.
11. **Merge Authority:** Merge authority is human-only: the agent opens PRs and reports CI status; it never merges.
12. **No Amend/Force-Push:** No amend/force-push on pushed branches without explicit approval — a fixup commit is the default.
## CODE PATH Protocol
Every code change: (1) load this file + docs/06 + relevant skill FIRST · (2) write code smallest-surface-first · (3) run pnpm lint/typecheck/test locally · (4) run the security skill self-review on any api/prisma/packages/auth change (checklist: idempotency anchor named? auth column on new endpoint? secrets touched? paise/UTC? minors gate?) · (5) PR must complete the 'Skills run' checklist.

