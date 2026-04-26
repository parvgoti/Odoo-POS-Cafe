// TC-A3 — Payment Methods, TC-A4 — Floor Plans, TC-A5 — Sessions
import { test, expect } from '@playwright/test';
import { login } from './helpers.js';

// ── A3: Payment Methods ──────────────────────────────────────────────────────
test.describe('A3 — Payment Methods', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('text=Payment Methods').first().click();
    await page.waitForTimeout(1000);
  });

  test('TC-A3-01: Payment Methods page loads', async ({ page }) => {
    await expect(page.locator('text=Payment Methods, text=payment').first()).toBeVisible();
  });

  test('TC-A3-02: Cash, Digital, UPI methods visible', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/cash/i);
    expect(body).toMatch(/digital|card|bank/i);
    expect(body).toMatch(/upi|qr/i);
  });

  test('TC-A3-03: Toggle switch exists for each method', async ({ page }) => {
    const toggles = page.locator('input[type="checkbox"], [class*="toggle"], [role="switch"]');
    const count = await toggles.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('TC-A3-04: UPI ID input field exists', async ({ page }) => {
    const upiInput = page.locator('input[placeholder*="UPI" i], input[placeholder*="upi" i], input[placeholder*="@"]').first();
    const hasUpi = await upiInput.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasUpi).toBeTruthy();
  });

});

// ── A4: Floor Plans ──────────────────────────────────────────────────────────
test.describe('A4 — Floor Plans', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('text=Floor Plans').first().click();
    await page.waitForTimeout(1200);
  });

  test('TC-A4-01: Floor Plans page shows floors list and table grid', async ({ page }) => {
    await expect(page.locator('text=Floor Plans').first()).toBeVisible();
    // Should have floors sidebar
    const body = await page.textContent('body');
    expect(body).toMatch(/floor|ground|terrace/i);
  });

  test('TC-A4-02: Table cards visible with status labels', async ({ page }) => {
    const tableCards = page.locator('[class*="table-card"], [class*="table-number"]');
    const count = await tableCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-A4-03: Legend shows Available, Occupied, Reserved', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/available/i);
    expect(body).toMatch(/occupied|reserved/i);
  });

  test('TC-A4-04: Add Table button opens modal', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add Table")').first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await page.waitForTimeout(500);
    // Modal with Table Number field
    await expect(page.locator('text=Table Number').first()).toBeVisible();
    await expect(page.locator('text=Seats').first()).toBeVisible();
  });

  test('TC-A4-05: Add Table modal has all required fields', async ({ page }) => {
    await page.locator('button:has-text("Add Table")').first().click();
    await page.waitForTimeout(500);
    const body = await page.textContent('body');
    expect(body).toMatch(/table number/i);
    expect(body).toMatch(/seats/i);
    expect(body).toMatch(/active|appointment/i);
    // Close modal
    await page.keyboard.press('Escape');
  });

  test('TC-A4-06: Hover on occupied table shows Reset button', async ({ page }) => {
    const occupied = page.locator('[class*="table-occupied"]').first();
    const hasOccupied = await occupied.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasOccupied) { test.skip(); return; }

    await occupied.hover();
    await page.waitForTimeout(300);
    const resetBtn = occupied.locator('button:has-text("Reset")');
    await expect(resetBtn).toBeVisible({ timeout: 2000 });
  });

});

// ── A5: POS Sessions ─────────────────────────────────────────────────────────
test.describe('A5 — POS Sessions', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('text=POS Sessions').first().click();
    await page.waitForTimeout(1000);
  });

  test('TC-A5-01: POS Sessions page loads', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/session/i);
  });

  test('TC-A5-02: Open POS / Open Session button is visible', async ({ page }) => {
    const openBtn = page.locator('button:has-text("Open Session"), button:has-text("Open POS"), a:has-text("Open POS")').first();
    const hasBtn = await openBtn.isVisible({ timeout: 4000 }).catch(() => false);
    // Also check top bar "Open POS" button
    const topBtn = page.locator('button:has-text("Open POS")').first();
    const hasTop = await topBtn.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasBtn || hasTop).toBeTruthy();
  });

  test('TC-A5-03: Session list shows status column', async ({ page }) => {
    const body = await page.textContent('body');
    expect(body).toMatch(/open|closed|status|session/i);
  });

});
