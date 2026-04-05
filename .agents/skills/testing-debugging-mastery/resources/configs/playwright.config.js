/**
 * Testing & Debugging Mastery — Playwright E2E Configuration (2026)
 * ==================================================================
 * Production-ready Playwright config for E2E testing.
 *
 * To use: Copy to your project root as playwright.config.js
 * Install: npx playwright install
 * Run: npx playwright test
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // ---- Test Directory ----
  testDir: './e2e',
  testMatch: '**/*.spec.{js,ts}',

  // ---- Parallelism ----
  fullyParallel: true,
  workers: process.env.CI ? 1 : '50%',

  // ---- Retries ----
  retries: process.env.CI ? 2 : 0,

  // ---- Failing Fast ----
  forbidOnly: !!process.env.CI,  // Prevent .only in CI
  maxFailures: process.env.CI ? 10 : undefined,

  // ---- Reporters ----
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { open: 'never', outputFolder: 'e2e-report' }],
        ['junit', { outputFile: 'e2e-results.xml' }],
      ]
    : [
        ['list'],
        ['html', { open: 'on-failure', outputFolder: 'e2e-report' }],
      ],

  // ---- Timeouts ----
  timeout: 30000,           // 30s per test
  expect: {
    timeout: 5000,          // 5s per assertion
  },

  // ---- Global Settings ----
  use: {
    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Artifacts on failure
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Browser settings
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    locale: 'en-US',
    timezoneId: 'America/New_York',

    // Action settings
    actionTimeout: 10000,
    navigationTimeout: 15000,

    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en',
    },
  },

  // ---- Projects (Browser Matrix) ----
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 15'] },
    },

    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],

  // ---- Dev Server ----
  webServer: {
    command: process.env.CI
      ? 'npm run start'    // Production build in CI
      : 'npm run dev',     // Dev server locally
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,       // 2 minutes to start
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // ---- Output ----
  outputDir: 'e2e-results',

  // ---- Global Setup/Teardown ----
  // globalSetup: './e2e/global-setup.ts',
  // globalTeardown: './e2e/global-teardown.ts',
});
