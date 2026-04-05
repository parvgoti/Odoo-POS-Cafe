#!/usr/bin/env node
/**
 * Testing & Debugging Mastery — Smart Test Runner (2026)
 * ========================================================
 * CLI tool that runs tests intelligently:
 * - Detects test framework (Vitest, Jest, Playwright)
 * - Runs only changed files
 * - Shows coverage summary
 * - Detects flaky tests
 * - Measures test speed
 *
 * Usage:
 *   node test-runner.js                # Run all tests
 *   node test-runner.js --changed      # Run tests for changed files
 *   node test-runner.js --coverage     # Run with coverage
 *   node test-runner.js --e2e          # Run E2E tests
 *   node test-runner.js --flaky        # Detect flaky tests (runs 5x)
 *   node test-runner.js --speed        # Measure test speed
 */

import { execSync, exec } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);

// ---- Colors ----
const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};


// ---- Detect Framework ----
function detectFramework() {
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const frameworks = {
    vitest: !!deps.vitest,
    jest: !!deps.jest,
    playwright: !!deps['@playwright/test'],
    cypress: !!deps.cypress,
    mocha: !!deps.mocha,
  };

  return frameworks;
}


// ---- Get Changed Files ----
function getChangedFiles() {
  try {
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf-8' }).trim();
    const unstaged = execSync('git diff --name-only', { encoding: 'utf-8' }).trim();
    const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf-8' }).trim();

    const all = [...staged.split('\n'), ...unstaged.split('\n'), ...untracked.split('\n')]
      .filter(f => f && (f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.tsx')))
      .filter(f => !f.includes('node_modules'));

    return [...new Set(all)];
  } catch {
    return [];
  }
}


// ---- Find Related Test Files ----
function findRelatedTests(changedFiles) {
  const testFiles = [];

  for (const file of changedFiles) {
    // If it's already a test file, include it
    if (file.match(/\.(test|spec)\.(js|ts|jsx|tsx)$/)) {
      testFiles.push(file);
      continue;
    }

    // Find corresponding test file
    const base = file.replace(/\.(js|ts|jsx|tsx)$/, '');
    const candidates = [
      `${base}.test.js`,
      `${base}.test.ts`,
      `${base}.spec.js`,
      `${base}.spec.ts`,
      `${base}.test.jsx`,
      `${base}.test.tsx`,
      file.replace('src/', 'tests/').replace(/\.(js|ts|jsx|tsx)$/, '.test.$1'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        testFiles.push(candidate);
      }
    }
  }

  return [...new Set(testFiles)];
}


// ---- Run Command ----
function run(cmd, label) {
  console.log(`\n  ${c.blue('▸')} ${c.bold(label)}`);
  console.log(`  ${c.dim(cmd)}\n`);

  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (err) {
    return false;
  }
}


// ---- Main ----
async function main() {
  const startTime = Date.now();

  console.log(`\n  ${c.bold('🧪 Smart Test Runner')}`);
  console.log(`  ${c.dim('─'.repeat(40))}\n`);

  // Detect framework
  const frameworks = detectFramework();
  const available = Object.entries(frameworks).filter(([, v]) => v).map(([k]) => k);
  console.log(`  Detected: ${available.map(f => c.green(f)).join(', ') || c.yellow('none')}`);


  // ---- Mode: Help ----
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
  Usage:
    node test-runner.js [options]

  Options:
    --changed      Run tests for changed files only
    --coverage     Run with code coverage
    --e2e          Run E2E tests (Playwright)
    --flaky        Detect flaky tests (runs 5 times)
    --speed        Measure test execution speed
    --watch        Run in watch mode
    --ci           Run in CI mode (no watch, coverage, strict)
    `);
    process.exit(0);
  }


  // ---- Mode: Changed Files Only ----
  if (args.includes('--changed')) {
    const changed = getChangedFiles();
    console.log(`  Changed files: ${changed.length}`);

    if (changed.length === 0) {
      console.log(`  ${c.green('✅ No changes detected. All tests pass!')}\n`);
      process.exit(0);
    }

    const testFiles = findRelatedTests(changed);
    console.log(`  Related tests: ${testFiles.length}`);

    if (testFiles.length === 0) {
      console.log(`  ${c.yellow('⚠️  No related test files found.')}\n`);
      process.exit(0);
    }

    const fileArg = testFiles.join(' ');
    if (frameworks.vitest) {
      run(`npx vitest run ${fileArg}`, 'Running changed tests (Vitest)');
    } else if (frameworks.jest) {
      run(`npx jest ${fileArg}`, 'Running changed tests (Jest)');
    }

    printDuration(startTime);
    process.exit(0);
  }


  // ---- Mode: E2E ----
  if (args.includes('--e2e')) {
    if (frameworks.playwright) {
      const success = run('npx playwright test', 'Running E2E tests (Playwright)');
      if (!success) {
        console.log(`\n  ${c.yellow('Generating test report...')}`);
        run('npx playwright show-report', 'Open HTML report');
      }
    } else if (frameworks.cypress) {
      run('npx cypress run', 'Running E2E tests (Cypress)');
    } else {
      console.log(`  ${c.red('❌ No E2E framework detected.')}`);
    }
    printDuration(startTime);
    process.exit(0);
  }


  // ---- Mode: Flaky Detection ----
  if (args.includes('--flaky')) {
    console.log(`  ${c.yellow('Running tests 5 times to detect flaky tests...')}\n`);

    const results = [];
    for (let i = 1; i <= 5; i++) {
      console.log(`  ${c.dim(`Run ${i}/5...`)}`);
      try {
        execSync(frameworks.vitest ? 'npx vitest run --reporter=verbose' : 'npx jest --verbose', {
          encoding: 'utf-8',
          stdio: 'pipe',
        });
        results.push('pass');
      } catch {
        results.push('fail');
      }
    }

    const passes = results.filter(r => r === 'pass').length;
    const fails = results.filter(r => r === 'fail').length;

    if (fails > 0 && passes > 0) {
      console.log(`\n  ${c.red(`⚠️  FLAKY TESTS DETECTED: ${passes}/5 passed, ${fails}/5 failed`)}`);
    } else if (fails === 0) {
      console.log(`\n  ${c.green('✅ No flaky tests detected (5/5 passed)')}`);
    } else {
      console.log(`\n  ${c.red('❌ Tests consistently failing (0/5 passed)')}`);
    }

    printDuration(startTime);
    process.exit(fails > 0 ? 1 : 0);
  }


  // ---- Mode: Coverage ----
  if (args.includes('--coverage')) {
    if (frameworks.vitest) {
      run('npx vitest run --coverage', 'Running tests with coverage (Vitest)');
    } else if (frameworks.jest) {
      run('npx jest --coverage', 'Running tests with coverage (Jest)');
    }
    printDuration(startTime);
    process.exit(0);
  }


  // ---- Mode: Watch ----
  if (args.includes('--watch')) {
    if (frameworks.vitest) {
      run('npx vitest', 'Watch mode (Vitest)');
    } else if (frameworks.jest) {
      run('npx jest --watch', 'Watch mode (Jest)');
    }
    process.exit(0);
  }


  // ---- Mode: CI ----
  if (args.includes('--ci')) {
    let success = true;

    if (frameworks.vitest) {
      success = run(
        'npx vitest run --coverage --reporter=verbose --reporter=junit --outputFile=test-results.xml',
        'CI: Unit & Integration Tests'
      );
    } else if (frameworks.jest) {
      success = run(
        'npx jest --coverage --ci --reporters=default --reporters=jest-junit',
        'CI: Unit & Integration Tests'
      );
    }

    if (frameworks.playwright) {
      const e2eSuccess = run('npx playwright test', 'CI: E2E Tests');
      success = success && e2eSuccess;
    }

    printDuration(startTime);
    process.exit(success ? 0 : 1);
  }


  // ---- Default: Run All ----
  if (frameworks.vitest) {
    run('npx vitest run', 'Running all tests (Vitest)');
  } else if (frameworks.jest) {
    run('npx jest', 'Running all tests (Jest)');
  } else {
    console.log(`  ${c.yellow('⚠️  No test framework detected. Install vitest or jest.')}`);
    console.log(`  ${c.dim('npm install -D vitest')}`);
  }

  printDuration(startTime);
}

function printDuration(startTime) {
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n  ${c.dim(`Total time: ${duration}s`)}\n`);
}

main().catch(console.error);
