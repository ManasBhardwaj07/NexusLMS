const { execSync } = require('child_process');

try {
  // Try to find the merge base with origin/main to see what changed in this PR
  const diff = execSync('git diff --name-only origin/main...HEAD').toString();
  const changedFiles = diff.split('\n').filter(Boolean).map(s => s.trim());

  const lockfileChanged = changedFiles.includes('pnpm-lock.yaml') || changedFiles.some(f => f.endsWith('package.json')) || changedFiles.includes('.nvmrc') || changedFiles.includes('.npmrc');
  const docsChanged = changedFiles.includes('docs/08-toolchain.md');

  if (lockfileChanged && !docsChanged) {
    console.error('ERROR: Toolchain Delta Violation!');
    console.error('You modified a toolchain file (package.json, pnpm-lock.yaml, .nvmrc, or .npmrc), but did not update docs/08-toolchain.md.');
    console.error('Rule §12: Any version change requires explicit human approval and an atomic PR touching docs/08-toolchain.md.');
    process.exit(1);
  } else {
    console.log('Toolchain Delta Gate: PASS (No unapproved toolchain changes detected)');
  }
} catch (error) {
  // If not in a git repo or no origin/main, try simple git diff HEAD
  console.log('Toolchain Delta Gate: origin/main not found, trying HEAD...');
  try {
    const diff = execSync('git diff --name-only HEAD').toString();
    const changedFiles = diff.split('\n').filter(Boolean).map(s => s.trim());

    const lockfileChanged = changedFiles.includes('pnpm-lock.yaml') || changedFiles.some(f => f.endsWith('package.json'));
    const docsChanged = changedFiles.includes('docs/08-toolchain.md');

    if (lockfileChanged && !docsChanged) {
      console.error('ERROR: Toolchain Delta Violation!');
      console.error('You modified package.json or pnpm-lock.yaml locally, but did not update docs/08-toolchain.md.');
      process.exit(1);
    }
  } catch (err) {
    console.log('Toolchain Delta Gate: Skipped (Not in a Git environment)');
  }
}
