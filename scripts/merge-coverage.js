/**
 * merge-coverage.js
 * Merges backend + frontend lcov.info files into a single combined HTML report.
 * Uses only Node.js built-ins + lcov-result-merger (pure JS, no Perl required).
 *
 * Run: node scripts/merge-coverage.js
 * Output: coverage/lcov-report/index.html  (relative to project root)
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');

const BACKEND_LCOV  = join(rootDir, 'backend',  'coverage', 'lcov.info');
const FRONTEND_LCOV = join(rootDir, 'frontend', 'coverage', 'lcov.info');
const OUT_DIR       = join(rootDir, 'coverage');
const MERGED_LCOV   = join(OUT_DIR, 'lcov.info');

// ── 1. Validate inputs ──────────────────────────────────────────────────────
const missing = [];
if (!existsSync(BACKEND_LCOV))  missing.push('backend/coverage/lcov.info');
if (!existsSync(FRONTEND_LCOV)) missing.push('frontend/coverage/lcov.info');

if (missing.length) {
  console.error('\n❌  Missing lcov files:');
  missing.forEach(f => console.error('   •', f));
  console.error('\nRun both coverage commands first:\n  npm run test:coverage  (from project root)\n');
  process.exit(1);
}

// ── 2. Merge lcov files & coverage-final.json ─────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });

const backendData  = readFileSync(BACKEND_LCOV,  'utf8');
const frontendData = readFileSync(FRONTEND_LCOV, 'utf8');

// Concatenate lcov files
const merged = [backendData.trim(), frontendData.trim()].join('\n');
writeFileSync(MERGED_LCOV, merged, 'utf8');
console.log('\n✅  Merged lcov.info written to:', MERGED_LCOV);

// Merge Istanbul JSON coverage files for nyc
const BACKEND_JSON  = join(rootDir, 'backend',  'coverage', 'coverage-final.json');
const FRONTEND_JSON = join(rootDir, 'frontend', 'coverage', 'coverage-final.json');
const NYC_DIR       = join(rootDir, '.nyc_output');

mkdirSync(NYC_DIR, { recursive: true });

let mergedCoverage = {};
if (existsSync(BACKEND_JSON)) {
  Object.assign(mergedCoverage, JSON.parse(readFileSync(BACKEND_JSON, 'utf8')));
}
if (existsSync(FRONTEND_JSON)) {
  Object.assign(mergedCoverage, JSON.parse(readFileSync(FRONTEND_JSON, 'utf8')));
}

writeFileSync(join(NYC_DIR, 'out.json'), JSON.stringify(mergedCoverage), 'utf8');

// ── 3. Generate HTML report using nyc ─────────────────────────────────────
console.log('\n📊  Generating HTML coverage report …\n');

try {
  execSync(
    `npx --yes nyc report --reporter=html --reporter=text-summary --report-dir="${join(OUT_DIR, 'lcov-report')}"`,
    { stdio: 'inherit', cwd: rootDir }
  );
} catch (e) {
  console.warn('\n⚠️  nyc HTML generation failed:', e.message);
}

// ── 4. Open in browser ───────────────────────────────────────────────────────
const reportPath = join(OUT_DIR, 'lcov-report', 'index.html');

if (existsSync(reportPath)) {
  console.log('\n🌐  Opening HTML report in browser…');
  const openCmd = process.platform === 'win32'
    ? `Start-Process '${reportPath}'`
    : process.platform === 'darwin'
      ? `open "${reportPath}"`
      : `xdg-open "${reportPath}"`;

  const shell = process.platform === 'win32' ? 'powershell' : '/bin/sh';
  const shellFlag = process.platform === 'win32' ? '-Command' : '-c';

  execSync(`${shell} ${shellFlag} "${openCmd}"`, { stdio: 'ignore' });
  console.log(`\n✅  Report opened: ${reportPath}\n`);
} else {
  console.log(`\n📁  Report ready at: ${reportPath}\n`);
}
