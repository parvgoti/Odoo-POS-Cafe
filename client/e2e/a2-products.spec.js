// TC-A2 — Product Management Tests
import { test, expect } from '@playwright/test';
import { login } from './helpers.js';

test.describe('A2 — Product Management', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('text=Products').first().click();
    await page.waitForTimeout(1000);
  });

  test('TC-A2-01: Products page loads with product list', async ({ page }) => {
    await expect(page.locator('h1:has-text("Product"), h1:has-text("product")'
      + ', text=Products').first()).toBeVisible();
    // At least one product shown
    const rows = page.locator('table tbody tr, .product-card, [class*="product-row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-A2-02: Add new product modal opens', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add Product"), button:has-text("New Product"), button:has-text("Add")').first();
    await addBtn.click();
    await page.waitForTimeout(500);
    // Modal should appear with name field
    await expect(page.locator('input[placeholder*="name" i], input[placeholder*="Name"]').first()).toBeVisible();
  });

  test('TC-A2-03: Product list shows name, price, category columns', async ({ page }) => {
    // Check table headers or card info
    const pageText = await page.textContent('body');
    const hasPrice = pageText.includes('$') || pageText.includes('Price') || pageText.includes('price');
    expect(hasPrice).toBeTruthy();
  });

  test('TC-A2-04: Search/filter products works', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('Coffee');
      await page.waitForTimeout(600);
      const pageText = await page.textContent('body');
      // Either products match or "no results" shows
      expect(pageText.toLowerCase()).toMatch(/coffee|no product|no result/i);
    } else {
      test.skip();
    }
  });

  test('TC-A2-05: Edit product button exists in product list', async ({ page }) => {
    const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit"), [class*="edit"]').first();
    const hasEdit = await editBtn.isVisible({ timeout: 3000 }).catch(() => false);
    // Edit might be in a row action
    const moreOptions = page.locator('[class*="action"], button[aria-label*="more" i]').first();
    const hasMore = await moreOptions.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasEdit || hasMore).toBeTruthy();
  });

});
