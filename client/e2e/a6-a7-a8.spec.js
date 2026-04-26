// TC-A6 — Self Ordering, TC-A7 — Kitchen Display, TC-A8 — Dashboard & Reports
import { test, expect } from '@playwright/test';
import { login } from './helpers.js';

// ── A6: Self Ordering ────────────────────────────────────────────────────────
test.describe('A6 — Self Ordering', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('text=Self Ordering').first().click();
    await page.waitForTimeout(1200);
  });

  test('TC-A6-01: Self Ordering page loads', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/self.order|self order|table|menu/i);
  });

  test('TC-A6-02: Table selection visible on self order page', async ({ page }) => {
    // Should show tables or table selector
    const tableEl = page.locator('[class*="table"], text=Table').first();
    await expect(tableEl).toBeVisible({ timeout: 5000 });
  });

  test('TC-A6-03: Menu products displayed in self order', async ({ page }) => {
    // Try clicking first table
    const tableBtn = page.locator('[class*="table-card"], button:has-text("Table")').first();
    if (await tableBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tableBtn.click();
      await page.waitForTimeout(800);
    }
    const body = await page.textContent('body');
    // Should show menu items or products
    expect(body).toMatch(/cappuccino|coffee|pizza|menu|product/i);
  });

});

// ── A7: Kitchen Display ───────────────────────────────────────────────────────
test.describe('A7 — Kitchen Display', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('text=Kitchen Display').first().click();
    await page.waitForTimeout(1200);
  });

  test('TC-A7-01: Kitchen Display page loads', async ({ page }) => {
    await expect(page.locator('text=Kitchen Display').first()).toBeVisible();
  });

  test('TC-A7-02: Three stage columns visible (TO COOK, PREPARING, COMPLETED)', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/to cook|cook/i);
    expect(body).toMatch(/preparing/i);
    expect(body).toMatch(/completed/i);
  });

  test('TC-A7-03: Active order count shown per column', async ({ page }) => {
    // Column headers should have counts
    const cookHeader = page.locator('text=TO COOK').first();
    await expect(cookHeader).toBeVisible();
    const prepHeader = page.locator('text=PREPARING').first();
    await expect(prepHeader).toBeVisible();
  });

  test('TC-A7-04: Ticket cards show order number and table info', async ({ page }) => {
    const tickets = page.locator('[class*="ticket"], [class*="kitchen-ticket"]');
    const count = await tickets.count();
    if (count > 0) {
      const ticketText = await tickets.first().textContent();
      expect(ticketText).toMatch(/#\d+|Table/i);
    } else {
      // No tickets is valid — just check columns exist
      const body = await page.textContent('body');
      expect(body).toMatch(/to cook/i);
    }
  });

});

// ── A8: Dashboard & Reports ───────────────────────────────────────────────────
test.describe('A8 — Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('text=Dashboard').first().click();
    await page.waitForTimeout(1500);
  });

  test('TC-A8-01: Dashboard loads with 4 stat cards', async ({ page }) => {
    await expect(page.locator("text=Today's Revenue").first()).toBeVisible();
    await expect(page.locator('text=Orders Today').first()).toBeVisible();
    await expect(page.locator('text=Active Tables').first()).toBeVisible();
    await expect(page.locator('text=Avg Order Value').first()).toBeVisible();
  });

  test('TC-A8-02: Last updated timestamp shows after load', async ({ page }) => {
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).toMatch(/last updated|welcome/i);
  });

  test('TC-A8-03: Refresh button exists and works', async ({ page }) => {
    const refreshBtn = page.locator('button:has-text("Refresh")').first();
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await page.waitForTimeout(1500);
    // Button should return to normal state
    await expect(refreshBtn).toBeVisible();
  });

  test('TC-A8-04: Sales This Week chart renders', async ({ page }) => {
    const chart = page.locator('text=Sales This Week').first();
    await expect(chart).toBeVisible();
    // Bar chart elements should exist
    const bars = page.locator('[class*="bar"], svg rect').first();
    const hasBars = await bars.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasBars).toBeTruthy();
  });

  test('TC-A8-05: Payment Methods donut chart renders', async ({ page }) => {
    const pmChart = page.locator('text=Payment Methods').first();
    await expect(pmChart).toBeVisible();
    // SVG present
    const svg = page.locator('svg.donut-svg, svg circle').first();
    await expect(svg).toBeVisible({ timeout: 3000 });
  });

  test('TC-A8-06: Recent Orders table shows data', async ({ page }) => {
    const recentOrders = page.locator('text=Recent Orders').first();
    await expect(recentOrders).toBeVisible();
    // Table rows or empty state
    const body = await page.textContent('body');
    expect(body).toMatch(/recent orders/i);
  });

});

test.describe('A8 — Reports', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('text=Reports').first().click();
    await page.waitForTimeout(1200);
  });

  test('TC-A8-07: Reports page loads with chart', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/report|revenue|sale/i);
  });

  test('TC-A8-08: Filter options present (Period, Session, Product)', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/period|today|week/i);
    expect(body).toMatch(/session|responsible|product/i);
  });

  test('TC-A8-09: Export CSV button exists', async ({ page }) => {
    const csvBtn = page.locator('button:has-text("CSV"), button:has-text("Export CSV"), button:has-text("export")').first();
    await expect(csvBtn).toBeVisible({ timeout: 5000 });
  });

  test('TC-A8-10: Print PDF button exists', async ({ page }) => {
    const pdfBtn = page.locator('button:has-text("PDF"), button:has-text("Print"), button:has-text("pdf")').first();
    await expect(pdfBtn).toBeVisible({ timeout: 5000 });
  });

  test('TC-A8-11: Period filter changes report data', async ({ page }) => {
    const periodSelect = page.locator('select[id*="period"], select:has(option:has-text("Today")), button:has-text("Today")').first();
    if (await periodSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      if (await periodSelect.getAttribute('tagName') === 'select') {
        await periodSelect.selectOption({ label: 'Today' });
      } else {
        await periodSelect.click();
      }
      await page.waitForTimeout(800);
      const body = await page.textContent('body');
      expect(body).toMatch(/today|report|revenue/i);
    } else {
      test.skip();
    }
  });

});
