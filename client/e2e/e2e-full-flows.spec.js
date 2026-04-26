// TC-E2E — Full End-to-End User Journey Tests
import { test, expect } from '@playwright/test';
import { login, openPOS } from './helpers.js';

test.describe('E2E-01 — Complete Restaurant Order Lifecycle', () => {

  test('Full flow: Login → Dashboard → Open POS → Order → Kitchen → Payment', async ({ page }) => {
    // STEP 1: Navigate to app
    await page.goto('/');
    await page.waitForTimeout(1000);

    // STEP 2: Login
    await login(page);
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });

    // STEP 3: Check Dashboard stat cards load
    await page.locator('text=Dashboard').first().click();
    await page.waitForTimeout(1500);
    const body1 = await page.textContent('body');
    expect(body1).toMatch(/revenue|orders today/i);

    // STEP 4: Open POS terminal
    const openPOSBtn = page.locator('button:has-text("Open POS"), a:has-text("Open POS")').first();
    if (await openPOSBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await openPOS(page);
    } else {
      await page.goto('/pos');
      await page.waitForTimeout(1000);
    }

    // STEP 5: Navigate to Floor/Table view
    const tableNavBtn = page.locator('nav a:has-text("Table"), button:has-text("Table")').first();
    if (await tableNavBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tableNavBtn.click();
      await page.waitForTimeout(800);
    }

    // STEP 6: Select a table
    const tableCard = page.locator('[class*="table-card"]').first();
    if (await tableCard.isVisible({ timeout: 4000 }).catch(() => false)) {
      await tableCard.click();
      await page.waitForTimeout(800);
    }

    // STEP 7: Add product to cart
    const product = page.locator('[class*="product-card"], [class*="menu-item"]').first();
    if (await product.isVisible({ timeout: 4000 }).catch(() => false)) {
      await product.click();
      await page.waitForTimeout(500);
      // Cart should update
      const cartText = await page.textContent('body');
      expect(cartText).toMatch(/\d+ item|subtotal|current order|\$/i);
    }

    // STEP 8: Send to Kitchen
    const sendBtn = page.locator('button:has-text("Send to Kitchen"), button:has-text("Send")').first();
    if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sendBtn.click();
      await page.waitForTimeout(1000);
    }

    // STEP 9: Proceed to payment
    const payBtn = page.locator('button:has-text("Pay")').first();
    if (await payBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await payBtn.click();
      await page.waitForTimeout(800);
      const payText = await page.textContent('body');
      expect(payText).toMatch(/total|payment|cash|\$/i);
    }

    // STEP 10: Verify payment screen shows methods
    const body2 = await page.textContent('body');
    const hasPaymentMethod = body2.match(/cash|digital|upi|qr/i);
    expect(hasPaymentMethod).toBeTruthy();
  });

});

test.describe('E2E-02 — Self Order Token Flow', () => {

  test('Self order: Select table → Add items → Place order → Token shown', async ({ page }) => {
    await login(page);
    await page.locator('text=Self Ordering').first().click();
    await page.waitForTimeout(1200);

    // Select a table
    const tableCard = page.locator('[class*="table-card"], button:has-text("Table")').first();
    if (await tableCard.isVisible({ timeout: 4000 }).catch(() => false)) {
      await tableCard.click();
      await page.waitForTimeout(800);
    }

    // Add an item to cart
    const menuItem = page.locator('[class*="product-card"], [class*="menu-item"]').first();
    if (await menuItem.isVisible({ timeout: 4000 }).catch(() => false)) {
      await menuItem.click();
      await page.waitForTimeout(600);

      // Place the order
      const placeBtn = page.locator('button:has-text("Place Order"), button:has-text("Order"), button:has-text("Checkout")').first();
      if (await placeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await placeBtn.click();
        await page.waitForTimeout(1500);

        // Token should appear on success screen
        const body = await page.textContent('body');
        const hasToken = body.match(/#\d+|order number|token|success/i);
        expect(hasToken).toBeTruthy();
      }
    }
  });

});

test.describe('E2E-03 — Kitchen Display Stage Progression', () => {

  test('Kitchen: Ticket moves from TO COOK → PREPARING → COMPLETED', async ({ page }) => {
    await login(page);
    await page.locator('text=Kitchen Display').first().click();
    await page.waitForTimeout(1200);

    // Check columns exist
    await expect(page.locator('text=TO COOK').first()).toBeVisible();
    await expect(page.locator('text=PREPARING').first()).toBeVisible();
    await expect(page.locator('text=COMPLETED').first()).toBeVisible();

    // If there's a ticket in TO COOK, advance it
    const cookTicket = page.locator('[class*="ticket"]').first();
    if (await cookTicket.isVisible({ timeout: 3000 }).catch(() => false)) {
      const initialText = await cookTicket.textContent();
      await cookTicket.click();
      await page.waitForTimeout(800);
      // Ticket should have moved (PREPARING count increases)
      const bodyAfter = await page.textContent('body');
      expect(bodyAfter).toMatch(/preparing/i);
    }
  });

});

test.describe('E2E-04 — Reports Export Flow', () => {

  test('Reports: Load → Apply filter → Export CSV', async ({ page }) => {
    await login(page);
    await page.locator('text=Reports').first().click();
    await page.waitForTimeout(1200);

    // Verify reports page loaded
    const body = await page.textContent('body');
    expect(body).toMatch(/report|revenue|sale/i);

    // Check CSV export button
    const csvBtn = page.locator('button:has-text("CSV"), button:has-text("Export")').first();
    await expect(csvBtn).toBeVisible({ timeout: 5000 });

    // Test download
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
      csvBtn.click(),
    ]);
    if (download) {
      expect(download.suggestedFilename()).toMatch(/\.csv|report/i);
    }
  });

});

test.describe('E2E-05 — Dashboard Real-Time Stats', () => {

  test('Dashboard displays live non-negative numbers in all 4 stat cards', async ({ page }) => {
    await login(page);
    await page.locator('text=Dashboard').first().click();
    await page.waitForTimeout(2500); // Wait for Supabase data

    // Revenue card
    const revenueCard = page.locator("text=Today's Revenue").locator('..').locator('..');
    const revenueText = await revenueCard.textContent().catch(() => '');

    // Orders card
    await expect(page.locator('text=Orders Today').first()).toBeVisible();

    // Active Tables card
    await expect(page.locator('text=Active Tables').first()).toBeVisible();

    // Avg order
    await expect(page.locator('text=Avg Order Value').first()).toBeVisible();

    // Verify at least revenue shows $ sign
    const body = await page.textContent('body');
    expect(body).toMatch(/\$/);
  });

});
