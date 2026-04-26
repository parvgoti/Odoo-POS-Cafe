/**
 * Testing & Debugging Mastery — Vitest Configuration (2026)
 * ==========================================================
 * Production-ready Vitest config for testing JavaScript/TypeScript projects.
 *
 * Supports: Unit tests, integration tests, React component tests.
 * To use: Copy to your project root as vitest.config.js
 */

import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    // ---- Environment ----
    // 'node' for backend, 'jsdom' or 'happy-dom' for frontend
    environment: 'node',

    // ---- Globals ----
    // Enable describe/it/expect without imports
    globals: true,

    // ---- File Patterns ----
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.next',
      'e2e/**',          // E2E tests use Playwright
      '**/*.e2e.{js,ts}',
    ],

    // ---- Setup Files ----
    // Run before each test file
    setupFiles: ['./tests/setup.js'],
    // Run once before entire suite
    globalSetup: [],

    // ---- Coverage ----
    coverage: {
      provider: 'v8',
      enabled: false,    // Enable with --coverage flag
      reporter: ['text', 'text-summary', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/*.test.{js,ts,jsx,tsx}',
        'src/**/*.spec.{js,ts,jsx,tsx}',
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/**/index.ts',
        'src/**/constants.ts',
        'src/config/**',
        'src/**/__mocks__/**',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      // Fail CI if below thresholds
      // check: true,
    },

    // ---- Path Aliases ----
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
      '@mocks': path.resolve(__dirname, './tests/__mocks__'),
    },

    // ---- Timeouts ----
    testTimeout: 10000,    // 10s per test
    hookTimeout: 10000,    // 10s for beforeAll/afterAll

    // ---- Reporter ----
    reporters: process.env.CI
      ? ['verbose', 'junit']
      : ['verbose'],
    outputFile: process.env.CI ? './test-results.xml' : undefined,

    // ---- Pool ----
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,    // parallel by default
        isolate: true,        // isolate test files
      },
    },

    // ---- Retry ----
    retry: process.env.CI ? 2 : 0,

    // ---- Sequence ----
    sequence: {
      shuffle: false,    // Enable to catch test order dependency
    },

    // ---- Mock ----
    mockReset: false,
    clearMocks: true,
    restoreMocks: true,

    // ---- Misc ----
    passWithNoTests: true,
    allowOnly: !process.env.CI,    // Prevent .only in CI
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
