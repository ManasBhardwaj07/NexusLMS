#!/usr/bin/env bash
# File-placement law — docs/06 §11. Fails the build on violations.
set -euo pipefail
fail=0

# 1. Only .md files allowed in docs/, skills/, .agents/
while IFS= read -r f; do
  echo "FAIL: $f — non-.md file inside prose/skill folder (placement law: must be .md)"
  fail=1
done < <(git ls-files 'docs/*' 'skills/*' '.agents/*' | grep -v '\.md$')


# 2. No prose inside code folders (exception: prisma/schema-notes.md — coupled to schema.prisma)
while IFS= read -r f; do
  [ "$f" = "prisma/schema-notes.md" ] && continue
  echo "FAIL: $f — markdown inside a code folder (section-not-file rule; move content to docs/)"
  fail=1
done < <(git ls-files 'web/**/*.md' 'api/**/*.md' 'packages/**/*.md' 'prisma/*.md' 'prisma/**/*.md')

# 3. Root rule: prose/config max 3 (README.md, .gitignore, .editorconfig) + functional dirs
root_prose=$(git ls-files | grep -E '^[^/]+$' | grep -cE '\.(md|txt)$|^\.gitignore$|^\.editorconfig$' || true)
if [ "$root_prose" -gt 3 ]; then
  echo "FAIL: root has $root_prose prose/config files (max 3)"
  fail=1
fi

# 4. Docs cap: 11 files, one-in-one-out
docs_count=$(git ls-files 'docs/*.md' | wc -l)
if [ "$docs_count" -gt 11 ]; then
  echo "FAIL: docs/ has $docs_count files (cap 11 — merge or remove one first)"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "Placement law: OK (docs=$docs_count files)"
else
  exit 1
fi
