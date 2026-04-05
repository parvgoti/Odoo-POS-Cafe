// TC-A1 — Authentication Tests
import { test, expect } from '@playwright/test';
import { login } from './helpers.js';

test.describe('A1 — Authentication', () => {

  test('TC-A1-01: Login page loads correctly', async ({ page }) => {
    await page.goto('/');
    // Should see login form OR dashboard (demo mode may auto-login)
    const loginVisible = await page.locator('input[type="email"], input[placeholder*="email" i]').isVisible({ timeout: 4000 }).catch(() => false);
    const dashVisible  = await page.locator('text=Dashboard').isVisible({ timeout: 4000 }).catch(() => false);
    expect(loginVisible || dashVisible).toBeTruthy();
  });

  test('TC-A1-02: Login with demo credentials reaches Dashboard', async ({ page }) => {
    await login(page);
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-A1-03: Invalid login shows error or stays on login', async ({ page }) => {
    await page.goto('/');
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    const isLoginPage = await emailInput.isVisible({ timeout: 3000 }).catch(() => false);

    if (isLoginPage) {
      await emailInput.fill('wrong@email.com');
      await page.locator('input[type="password"]').first().fill('WrongPassword');
      await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
      await page.waitForTimeout(2000);
      // Should NOT be on dashboard
      const onDash = await page.locator('text=Today\'s Revenue').isVisible({ timeout: 2000 }).catch(() => false);
      expect(onDash).toBeFalsy();
    } else {
      test.skip(); // App running in demo mode — skip this test
    }
  });

  test('TC-A1-04: All sidebar menu items accessible after login', async ({ page }) => {
    await login(page);
    const menuItems = ['Dashboard', 'Orders', 'Products', 'Payment Methods', 'Floor Plans', 'POS Sessions', 'Self Ordering', 'Kitchen Display', 'Reports', 'Settings'];
    for (const item of menuItems) {
      await expect(page.locator(`text=${item}`).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-A1-05: Logout button is accessible', async ({ page }) => {
    await login(page);
    await expect(page.locator('text=Logout').first()).toBeVisible({ timeout: 5000 });
  });

});
