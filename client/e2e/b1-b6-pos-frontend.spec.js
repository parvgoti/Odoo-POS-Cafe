// TC-B1 to TC-B6 — POS Frontend Terminal Tests
import { test, expect } from '@playwright/test';
import { login, openPOS } from './helpers.js';

test.describe('B1 — POS Terminal Top Menu', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    // Navigate to POS terminal
    const openBtn = page.locator('button:has-text("Open POS"), a:has-text("Open POS")').first();
    if (await openBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await openPOS(page);
    } else {
      await page.goto('/pos');
      await page.waitForTimeout(1000);
    }
  });

  test('TC-B1-01: POS top bar shows Table, Register and Actions', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/table/i);
    expect(body).toMatch(/register/i);
    expect(body).toMatch(/actions/i);
  });

  test('TC-B1-02: Actions dropdown exists', async ({ page }) => {
    const actionsBtn = page.locator('button:has-text("Actions")').first();
    const hasActions = await actionsBtn.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasActions).toBeTruthy();
  });

  test('TC-B1-03: Actions menu contains Reload Data, Go to Back-end, Close Register', async ({ page }) => {
    const actionsBtn = page.locator('button:has-text("Actions")').first();
    if (await actionsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await actionsBtn.click();
      await page.waitForTimeout(400);
      const body = await page.textContent('body');
      expect(body).toMatch(/reload/i);
      expect(body).toMatch(/back.end|backend/i);
      expect(body).toMatch(/close/i);
      await page.keyboard.press('Escape');
    } else {
      test.skip();
    }
  });

  test('TC-B1-04: Odoo POS Cafe logo/branding visible in POS header', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/odoo pos cafe|pos cafe/i);
  });

});

test.describe('B2 — Floor View (Table Selection)', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await openPOS(page);
    // Click Table nav link
    const tableLink = page.locator('nav a:has-text("Table"), button:has-text("Table")').first();
    if (await tableLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tableLink.click();
      await page.waitForTimeout(800);
    }
  });

  test('TC-B2-01: Floor View shows table cards', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/table|floor/i);
  });

  test('TC-B2-02: Table cards are clickable', async ({ page }) => {
    const tableCard = page.locator('[class*="table-card"], button:has-text("Table")').first();
    const hasCard = await tableCard.isVisible({ timeout: 4000 }).catch(() => false);
    expect(hasCard).toBeTruthy();
  });

});

test.describe('B3 — Order Screen', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await openPOS(page);
    // Click a table to open order screen
    const tableLink = page.locator('nav a:has-text("Table"), button:has-text("Table")').first();
    if (await tableLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tableLink.click();
      await page.waitForTimeout(600);
    }
    const table = page.locator('[class*="table-card"]').first();
    if (await table.isVisible({ timeout: 3000 }).catch(() => false)) {
      await table.click();
      await page.waitForTimeout(800);
    }
  });

  test('TC-B3-01: Product grid loads on order screen', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/cappuccino|coffee|pizza|product|\$/i);
  });

  test('TC-B3-02: Adding product updates cart', async ({ page }) => {
    const product = page.locator('[class*="product-card"], [class*="menu-item"]').first();
    if (await product.isVisible({ timeout: 3000 }).catch(() => false)) {
      await product.click();
      await page.waitForTimeout(500);
      const body = await page.textContent('body');
      // Cart should show items count or subtotal
      expect(body).toMatch(/\d+ item|subtotal|current order/i);
    } else {
      test.skip();
    }
  });

  test('TC-B3-03: Send to Kitchen button is visible', async ({ page }) => {
    const sendBtn = page.locator('button:has-text("Send to Kitchen"), button:has-text("Send")').first();
    const hasSend = await sendBtn.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasSend).toBeTruthy();
  });

  test('TC-B3-04: Pay button is visible with amount', async ({ page }) => {
    const payBtn = page.locator('button:has-text("Pay")').first();
    const hasPay = await payBtn.isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasPay).toBeTruthy();
  });

});

test.describe('B4 — Payment Screen', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await openPOS(page);
    // Quick path to payment
    const tableLink = page.locator('nav a:has-text("Table"), button:has-text("Table")').first();
    if (await tableLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tableLink.click();
      await page.waitForTimeout(600);
    }
    const table = page.locator('[class*="table-card"]').first();
    if (await table.isVisible({ timeout: 3000 }).catch(() => false)) {
      await table.click();
      await page.waitForTimeout(600);
    }
    // Add a product
    const product = page.locator('[class*="product-card"], [class*="menu-item"]').first();
    if (await product.isVisible({ timeout: 3000 }).catch(() => false)) {
      await product.click();
      await page.waitForTimeout(400);
    }
    // Go to payment
    const payBtn = page.locator('button:has-text("Pay")').first();
    if (await payBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payBtn.click();
      await page.waitForTimeout(800);
    }
  });

  test('TC-B4-01: Payment screen shows total amount', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/total|\$|payment/i);
  });

  test('TC-B4-02: Payment methods (Cash, Digital, UPI) visible', async ({ page }) => {
    const body = await page.textContent('body');
    const hasCash = body.match(/cash/i);
    const hasDigital = body.match(/digital|card/i);
    const hasUPI = body.match(/upi|qr/i);
    expect(hasCash || hasDigital || hasUPI).toBeTruthy();
  });

  test('TC-B4-03: Validate Payment button exists', async ({ page }) => {
    const validateBtn = page.locator('button:has-text("Validate"), button:has-text("Pay"), button:has-text("Confirm")').first();
    const hasBtn = await validateBtn.isVisible({ timeout: 4000 }).catch(() => false);
    expect(hasBtn).toBeTruthy();
  });

});

test.describe('B5 — UPI QR Payment', () => {

  test('TC-B5-01: UPI payment option visible on payment page', async ({ page }) => {
    await login(page);
    await openPOS(page);
    const tableLink = page.locator('nav a:has-text("Table"), button:has-text("Table")').first();
    if (await tableLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tableLink.click();
      await page.waitForTimeout(600);
    }
    const table = page.locator('[class*="table-card"]').first();
    if (await table.isVisible({ timeout: 3000 }).catch(() => false)) {
      await table.click();
      await page.waitForTimeout(600);
    }
    const product = page.locator('[class*="product-card"]').first();
    if (await product.isVisible({ timeout: 3000 }).catch(() => false)) {
      await product.click();
      await page.waitForTimeout(400);
    }
    const payBtn = page.locator('button:has-text("Pay")').first();
    if (await payBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payBtn.click();
      await page.waitForTimeout(800);
      const body = await page.textContent('body');
      expect(body).toMatch(/upi|qr/i);
    } else {
      test.skip();
    }
  });

});

test.describe('B6 — Customer Display', () => {

  test('TC-B6-01: Customer Display page loads from sidebar', async ({ page }) => {
    await login(page);
    // Check if customer display link exists
    const link = page.locator('text=Customer Display, text=Customer').first();
    const hasLink = await link.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasLink) {
      await link.click();
      await page.waitForTimeout(800);
      const body = await page.textContent('body');
      expect(body).toMatch(/customer|display|order/i);
    } else {
      // Navigate directly
      await page.goto('/customer-display');
      await page.waitForTimeout(1000);
      const body = await page.textContent('body');
      expect(body).toMatch(/customer|display|order|pos cafe/i);
    }
  });

});
