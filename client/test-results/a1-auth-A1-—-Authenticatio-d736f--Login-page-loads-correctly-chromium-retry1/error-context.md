# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a1-auth.spec.js >> A1 — Authentication >> TC-A1-01: Login page loads correctly
- Location: e2e\a1-auth.spec.js:7:3

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - img [ref=e7]
        - generic [ref=e9]: Odoo POS Cafe
      - button "Toggle sidebar" [ref=e10] [cursor=pointer]:
        - img [ref=e11]
    - navigation [ref=e13]:
      - link "Dashboard" [ref=e14] [cursor=pointer]:
        - /url: /
        - img [ref=e15]
        - generic [ref=e20]: Dashboard
      - link "Orders" [ref=e21] [cursor=pointer]:
        - /url: /orders
        - img [ref=e22]
        - generic [ref=e25]: Orders
      - link "Products" [ref=e26] [cursor=pointer]:
        - /url: /products
        - img [ref=e27]
        - generic [ref=e31]: Products
      - link "Payment Methods" [ref=e32] [cursor=pointer]:
        - /url: /payment-methods
        - img [ref=e33]
        - generic [ref=e35]: Payment Methods
      - link "Floor Plans" [ref=e36] [cursor=pointer]:
        - /url: /floor-plans
        - img [ref=e37]
        - generic [ref=e41]: Floor Plans
      - link "POS Sessions" [ref=e42] [cursor=pointer]:
        - /url: /sessions
        - img [ref=e43]
        - generic [ref=e45]: POS Sessions
      - link "Self Ordering" [ref=e46] [cursor=pointer]:
        - /url: /self-ordering
        - img [ref=e47]
        - generic [ref=e49]: Self Ordering
      - link "Kitchen Display" [ref=e50] [cursor=pointer]:
        - /url: /kitchen
        - img [ref=e51]
        - generic [ref=e53]: Kitchen Display
      - link "Reports" [ref=e54] [cursor=pointer]:
        - /url: /reports
        - img [ref=e55]
        - generic [ref=e57]: Reports
      - link "Settings" [ref=e58] [cursor=pointer]:
        - /url: /settings
        - img [ref=e59]
        - generic [ref=e62]: Settings
    - generic [ref=e63]:
      - generic [ref=e64]:
        - generic [ref=e65]: A
        - generic [ref=e66]:
          - generic [ref=e67]: Admin User
          - generic [ref=e68]: admin
      - button "Logout" [ref=e69] [cursor=pointer]:
        - img [ref=e70]
        - generic [ref=e73]: Logout
  - banner [ref=e74]:
    - generic [ref=e76]:
      - img
      - textbox "Search..." [ref=e77]
    - generic [ref=e78]:
      - button "Notifications" [ref=e79] [cursor=pointer]:
        - img [ref=e80]
      - button "Toggle Theme" [ref=e84] [cursor=pointer]:
        - img [ref=e86]
      - button "Open POS" [ref=e92] [cursor=pointer]:
        - img [ref=e93]
        - text: Open POS
  - main [ref=e95]:
    - generic [ref=e96]:
      - generic [ref=e97]:
        - generic [ref=e98]:
          - heading "Dashboard" [level=1] [ref=e99]
          - paragraph [ref=e100]: Welcome back! Here's your cafe overview.
        - button "Refresh" [ref=e101] [cursor=pointer]:
          - img [ref=e102]
          - text: Refresh
      - generic [ref=e107]:
        - generic [ref=e109]:
          - generic [ref=e110]: Today's Revenue
          - img [ref=e112]
        - generic [ref=e116]:
          - generic [ref=e117]: Orders Today
          - img [ref=e119]
        - generic [ref=e124]:
          - generic [ref=e125]:
            - generic [ref=e126]: Active Tables
            - img [ref=e128]
          - generic [ref=e134]: Currently occupied
        - generic [ref=e136]:
          - generic [ref=e137]: Avg Order Value
          - img [ref=e139]
      - generic [ref=e143]:
        - generic [ref=e144]:
          - heading "Sales This Week" [level=3] [ref=e145]
          - generic [ref=e147]:
            - generic [ref=e148]:
              - 'generic "undefined: $0.00"'
            - generic [ref=e149]:
              - 'generic "undefined: $0.00"'
            - generic [ref=e150]:
              - 'generic "undefined: $0.00"'
            - generic [ref=e151]:
              - 'generic "undefined: $0.00"'
            - generic [ref=e152]:
              - 'generic "undefined: $0.00"'
            - generic [ref=e153]:
              - 'generic "undefined: $0.00"'
            - generic [ref=e154]:
              - 'generic "undefined: $0.00"'
        - generic [ref=e155]:
          - heading "Payment Methods" [level=3] [ref=e156]
          - generic [ref=e158]:
            - img [ref=e159]
            - generic [ref=e163]:
              - generic [ref=e164]: Cash (0%)
              - generic [ref=e166]: Digital (0%)
              - generic [ref=e168]: UPI (100%)
      - heading "Recent Orders" [level=3] [ref=e171]
```

# Test source

```ts
  1  | // TC-A1 — Authentication Tests
  2  | import { test, expect } from '@playwright/test';
  3  | import { login } from './helpers.js';
  4  | 
  5  | test.describe('A1 — Authentication', () => {
  6  | 
  7  |   test('TC-A1-01: Login page loads correctly', async ({ page }) => {
  8  |     await page.goto('/');
  9  |     // Should see login form OR dashboard (demo mode may auto-login)
  10 |     const loginVisible = await page.locator('input[type="email"], input[placeholder*="email" i]').isVisible({ timeout: 4000 }).catch(() => false);
  11 |     const dashVisible  = await page.locator('text=Dashboard').isVisible({ timeout: 4000 }).catch(() => false);
> 12 |     expect(loginVisible || dashVisible).toBeTruthy();
     |                                         ^ Error: expect(received).toBeTruthy()
  13 |   });
  14 | 
  15 |   test('TC-A1-02: Login with demo credentials reaches Dashboard', async ({ page }) => {
  16 |     await login(page);
  17 |     await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
  18 |   });
  19 | 
  20 |   test('TC-A1-03: Invalid login shows error or stays on login', async ({ page }) => {
  21 |     await page.goto('/');
  22 |     const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  23 |     const isLoginPage = await emailInput.isVisible({ timeout: 3000 }).catch(() => false);
  24 | 
  25 |     if (isLoginPage) {
  26 |       await emailInput.fill('wrong@email.com');
  27 |       await page.locator('input[type="password"]').first().fill('WrongPassword');
  28 |       await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
  29 |       await page.waitForTimeout(2000);
  30 |       // Should NOT be on dashboard
  31 |       const onDash = await page.locator('text=Today\'s Revenue').isVisible({ timeout: 2000 }).catch(() => false);
  32 |       expect(onDash).toBeFalsy();
  33 |     } else {
  34 |       test.skip(); // App running in demo mode — skip this test
  35 |     }
  36 |   });
  37 | 
  38 |   test('TC-A1-04: All sidebar menu items accessible after login', async ({ page }) => {
  39 |     await login(page);
  40 |     const menuItems = ['Dashboard', 'Orders', 'Products', 'Payment Methods', 'Floor Plans', 'POS Sessions', 'Self Ordering', 'Kitchen Display', 'Reports', 'Settings'];
  41 |     for (const item of menuItems) {
  42 |       await expect(page.locator(`text=${item}`).first()).toBeVisible({ timeout: 5000 });
  43 |     }
  44 |   });
  45 | 
  46 |   test('TC-A1-05: Logout button is accessible', async ({ page }) => {
  47 |     await login(page);
  48 |     await expect(page.locator('text=Logout').first()).toBeVisible({ timeout: 5000 });
  49 |   });
  50 | 
  51 | });
  52 | 
```