import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const CAP = 8;
const REQUIRED_FILES = [
  'MASTER.md',
  '01-prd.md',
  '02-architecture-trd.md',
  '03-api-contract.md',
  '05-uiux-spec.md',
  '06-engineering-rules.md',
  '07-execution-plan.md',
  '08-toolchain.md'
];

let fail = false;

// 1. Verify cap
const mdFiles = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));
if (mdFiles.length > CAP) {
  console.error(`FAIL: docs/ has ${mdFiles.length} files (cap ${CAP} — merge or remove a doc first)`);
  fail = true;
} else {
  console.log(`Docs cap: OK (${mdFiles.length} files, cap ${CAP})`);
}

// 2. Verify required files
for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(DOCS_DIR, file))) {
    console.error(`FAIL: Required doc ${file} is missing`);
    fail = true;
  }
}

if (fail) {
  process.exit(1);
} else {
  console.log('Docs sanity: PASS (All required files present)');
}
