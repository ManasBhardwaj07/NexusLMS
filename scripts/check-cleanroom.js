const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const rootDir = process.cwd();
const projects = ['api', 'web', 'packages/auth'];
let failed = false;

for (const project of projects) {
  try {
    // We use tsc --listFiles to ask the compiler exactly which files it loaded, 
    // ensuring no host environment leakage bypasses our configuration.
    const output = execSync(`pnpm --filter ${project} exec tsc --listFiles`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const files = output.split(/\r?\n/).filter(Boolean);
    
    for (const file of files) {
      // v1 scans @types roots only; module-resolution leaks (e.g. buffer) are a known accepted gap;
      // trigger: revisit if CI ever diverges again.
      if (!file.includes('@types')) continue;
      
      const relative = path.relative(rootDir, file);
      
      // Path check 1: standard out-of-repo relative path (e.g., ../../node_modules)
      if (relative.startsWith('..' + path.sep) || relative === '..') {
        console.error(`[FAIL] CLEAN-ROOM VIOLATION in ${project}: @types definition loaded from out-of-repo path:`);
        console.error(`  -> ${file}`);
        failed = true;
      } 
      // Path check 2: cross-drive absolute path (reachable on Windows when resolving outside C:)
      else if (path.isAbsolute(relative) && !file.toLowerCase().startsWith(rootDir.toLowerCase())) {
        console.error(`[FAIL] CLEAN-ROOM VIOLATION in ${project}: @types definition loaded from cross-drive out-of-repo path:`);
        console.error(`  -> ${file}`);
        failed = true;
      }
    }
  } catch (error) {
    console.error(`Failed to run tsc --listFiles for ${project}`);
    if (error.stdout) console.error(error.stdout.toString());
    failed = true;
  }
}

if (failed) {
  console.error('\nClean-room isolation failed. TypeScript is loading types from outside the repository.');
  process.exit(1);
} else {
  console.log('Clean-room isolation check passed. No out-of-repo types detected.');
}
