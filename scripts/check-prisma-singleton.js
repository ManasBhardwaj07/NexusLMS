const fs = require('fs');
const { execSync } = require('child_process');

try {
  // Find all instances of "new PrismaClient(" in the codebase
  const result = execSync('git grep "new PrismaClient" -- "*.ts" "*.tsx" "*.js"', { encoding: 'utf8' });
  const lines = result.trim().split('\n');

  const violations = lines.filter(line =>
    !line.includes('lib/prisma.ts') &&
    !line.startsWith('prisma/seed.ts') &&
    line.trim().length > 0
  );

  if (violations.length > 0) {
    console.error('FAIL: "new PrismaClient" found outside lib/prisma.ts (10-Clients HMR/exhaustion gotcha).');
    violations.forEach(v => console.error(v));
    process.exit(1);
  } else {
    console.log('Prisma singleton check: PASS');
  }
} catch (err) {
  // git grep returns 1 if no matches are found, which is fine
  if (err.status === 1) {
    console.log('Prisma singleton check: PASS (no PrismaClient found)');
  } else {
    console.error('Error running check:', err.message);
    process.exit(1);
  }
}
