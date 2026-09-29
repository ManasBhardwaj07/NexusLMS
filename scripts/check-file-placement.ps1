$ErrorActionPreference = "Stop"
$fail = $false

# 1. Only .md files allowed in docs/, skills/, .agents/
$nonMdFiles = git ls-files 'docs/*' 'skills/*' '.agents/*' | Where-Object { $_ -notmatch '\.md$' }
foreach ($f in $nonMdFiles) {
    Write-Host "FAIL: $f - non-.md file inside prose/skill folder (placement law: must be .md)"
    $fail = $true
}

# 2. No prose inside code folders (exception: prisma/schema-notes.md)
$codeMdFiles = git ls-files 'web/**/*.md' 'api/**/*.md' 'packages/**/*.md' 'prisma/*.md' 'prisma/**/*.md'
foreach ($f in $codeMdFiles) {
    if ($f -eq "prisma/schema-notes.md") { continue }
    Write-Host "FAIL: $f - markdown inside a code folder (section-not-file rule; move content to docs/)"
    $fail = $true
}

# 3. Root rule: prose/config max 3 (README.md, .gitignore, .editorconfig) + functional dirs
$rootFiles = git ls-files | Where-Object { $_ -notmatch '/' }
$rootProseCount = ($rootFiles | Where-Object { $_ -match '\.(md|txt)$|^\.gitignore$|^\.editorconfig$' }).Count
if ($rootProseCount -gt 3) {
    Write-Host "FAIL: root has $rootProseCount prose/config files (max 3)"
    $fail = $true
}

# 4. Docs cap: 8 files, one-in-one-out
$docsCount = (git ls-files 'docs/*.md').Count
if ($docsCount -gt 8) {
    Write-Host "FAIL: docs/ has $docsCount files (cap 8 - merge or remove one first)"
    $fail = $true
}

if (-not $fail) {
    Write-Host "Placement law: OK (docs=$docsCount files)"
    exit 0
} else {
    exit 1
}
