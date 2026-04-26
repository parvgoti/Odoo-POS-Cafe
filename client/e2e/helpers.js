// e2e/helpers.js — Shared helpers for all test suites
import { expect } from '@playwright/test';

export const BASE = 'http://localhost:5173';

/** Login with demo credentials (app runs in DEMO_MODE) */
export async function login(page) {
  await page.goto('/');
  // In DEMO_MODE the app auto-logs in or accepts any credentials
  // Try clicking sign-in if login form is visible
  const emailInput = page.locator('input[type="email"], input[placeholder*="Email"]').first();
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill('admin@cafe.com');
    const pwInput = page.locator('input[type="password"]').first();
    await pwInput.fill('admin123');
    await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
  }
  // Wait for dashboard or sidebar to be visible
  await page.waitForSelector('text=Dashboard, text=Odoo POS Cafe', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

/** Navigate via sidebar */
export async function goTo(page, menuText) {
  await page.locator(`nav a:has-text("${menuText}"), aside a:has-text("${menuText}"), .sidebar a:has-text("${menuText}")`).first().click();
  await page.waitForTimeout(800);
}

/** Open POS terminal */
export async function openPOS(page) {
  const openBtn = page.locator('button:has-text("Open POS"), button:has-text("Open Session"), a:has-text("Open POS")').first();
  if (await openBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await openBtn.click();
    await page.waitForTimeout(1500);
    // Handle opening cash modal if present
    const cashInput = page.locator('input[placeholder*="opening"], input[placeholder*="cash"], input[placeholder*="amount"]').first();
    if (await cashInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cashInput.fill('1000');
      await page.locator('button:has-text("Open"), button:has-text("Confirm"), button:has-text("Start")').first().click();
      await page.waitForTimeout(1000);
    }
  }
}
