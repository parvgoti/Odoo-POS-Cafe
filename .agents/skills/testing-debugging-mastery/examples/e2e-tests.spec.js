/**
 * Testing & Debugging Mastery — E2E Test Examples (Playwright, 2026)
 * ===================================================================
 * Complete E2E test examples covering auth, navigation, CRUD, forms,
 * responsive design, and visual regression.
 */

import { test, expect } from '@playwright/test';


// ============================================
// 1. AUTHENTICATION FLOWS
// ============================================
test.describe('Authentication', () => {

  test('full registration flow', async ({ page }) => {
    await page.goto('/register');

    // Fill the form
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill(`e2e-${Date.now()}@test.com`);
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByLabel('Confirm Password').fill('SecurePass123!');

    // Accept terms
    await page.getByLabel(/terms/i).check();

    // Submit
    await page.getByRole('button', { name: /create account/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });


  test('login → dashboard → logout flow', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Logout
    await page.getByRole('button', { name: /profile/i }).click();
    await page.getByRole('menuitem', { name: /log out/i }).click();

    // Back to login
    await expect(page).toHaveURL(/\/login/);
  });


  test('shows validation errors', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Check for error messages
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });


  test('protects authenticated routes', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});


// ============================================
// 2. NAVIGATION & LAYOUT
// ============================================
test.describe('Navigation', () => {

  test('navigates between pages', async ({ page }) => {
    await page.goto('/');

    // Click navigation links
    await page.getByRole('link', { name: /features/i }).click();
    await expect(page).toHaveURL(/\/features/);

    await page.getByRole('link', { name: /pricing/i }).click();
    await expect(page).toHaveURL(/\/pricing/);

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/features/);
  });


  test('shows 404 for unknown pages', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-xyz');
    await expect(page.getByText(/not found|404/i)).toBeVisible();
  });


  test('mobile menu works', async ({ page }) => {
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Menu should be hidden
    await expect(page.getByRole('navigation')).not.toBeVisible();

    // Open hamburger menu
    await page.getByRole('button', { name: /menu/i }).click();
    await expect(page.getByRole('navigation')).toBeVisible();

    // Click a link
    await page.getByRole('link', { name: /features/i }).click();
    await expect(page).toHaveURL(/\/features/);

    // Menu should close
    await expect(page.getByRole('navigation')).not.toBeVisible();
  });
});


// ============================================
// 3. CRUD OPERATIONS
// ============================================
test.describe('Posts CRUD', () => {

  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/);
  });


  test('creates a new post', async ({ page }) => {
    await page.getByRole('link', { name: /new post/i }).click();
    await expect(page).toHaveURL(/\/posts\/new/);

    // Fill form
    await page.getByLabel('Title').fill('E2E Test Post');
    await page.getByLabel('Content').fill('This is an automated E2E test post.');

    // Select category
    await page.getByLabel('Category').selectOption('Technology');

    // Add tags
    await page.getByPlaceholder(/add tag/i).fill('e2e');
    await page.keyboard.press('Enter');
    await page.getByPlaceholder(/add tag/i).fill('testing');
    await page.keyboard.press('Enter');

    // Publish
    await page.getByRole('button', { name: /publish/i }).click();

    // Verify success
    await expect(page.getByText(/post published/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'E2E Test Post' })).toBeVisible();
  });


  test('edits an existing post', async ({ page }) => {
    // Navigate to a post
    await page.goto('/dashboard/posts');
    await page.getByText('E2E Test Post').click();

    // Edit mode
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel('Title').fill('Updated E2E Post');
    await page.getByRole('button', { name: /save/i }).click();

    // Verify
    await expect(page.getByText(/post updated/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Updated E2E Post' })).toBeVisible();
  });


  test('deletes a post with confirmation', async ({ page }) => {
    await page.goto('/dashboard/posts');

    // Click delete on a post
    const post = page.getByTestId('post-item').first();
    await post.getByRole('button', { name: /delete/i }).click();

    // Confirm dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/are you sure/i)).toBeVisible();

    // Confirm
    await dialog.getByRole('button', { name: /confirm/i }).click();

    // Verify deleted
    await expect(page.getByText(/post deleted/i)).toBeVisible();
  });
});


// ============================================
// 4. FORM INTERACTIONS
// ============================================
test.describe('Complex Forms', () => {

  test('file upload', async ({ page }) => {
    await page.goto('/upload');

    // Upload a file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /choose file/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('./e2e/fixtures/test-image.png');

    // Verify preview
    await expect(page.getByAltText(/preview/i)).toBeVisible();

    // Submit
    await page.getByRole('button', { name: /upload/i }).click();
    await expect(page.getByText(/uploaded successfully/i)).toBeVisible();
  });


  test('search with autocomplete', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('test');

    // Wait for autocomplete dropdown
    const suggestions = page.getByRole('listbox');
    await expect(suggestions).toBeVisible();

    // Select first suggestion
    await suggestions.getByRole('option').first().click();

    // Verify selection
    await expect(searchInput).not.toHaveValue('test');
  });
});


// ============================================
// 5. RESPONSIVE DESIGN
// ============================================
test.describe('Responsive Design', () => {

  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`homepage renders correctly on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Take screenshot for visual comparison
      await expect(page).toHaveScreenshot(`homepage-${vp.name.toLowerCase()}.png`, {
        maxDiffPixelRatio: 0.02,
        fullPage: false,
      });
    });
  }
});


// ============================================
// 6. PERFORMANCE CHECKS
// ============================================
test.describe('Performance', () => {

  test('homepage loads within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(3000);
  });


  test('no console errors on key pages', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const pages = ['/', '/login', '/register', '/features', '/pricing'];
    for (const p of pages) {
      await page.goto(p);
      await page.waitForLoadState('networkidle');
    }

    expect(errors).toHaveLength(0);
  });
});


console.log('✅ E2E test examples loaded — Playwright');
