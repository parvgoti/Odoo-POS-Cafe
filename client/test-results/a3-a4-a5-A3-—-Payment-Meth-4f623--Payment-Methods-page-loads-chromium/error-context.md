# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a3-a4-a5.spec.js >> A3 — Payment Methods >> TC-A3-01: Payment Methods page loads
- Location: e2e\a3-a4-a5.spec.js:14:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Payment Methods, text=payment').first()
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('text=Payment Methods, text=payment').first()

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
      - link "Payment Methods" [active] [ref=e32] [cursor=pointer]:
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
      - generic [ref=e98]:
        - heading "Payment Methods" [level=1] [ref=e99]
        - paragraph [ref=e100]: Configure accepted payment methods for your POS
      - generic [ref=e101]:
        - generic [ref=e102]:
          - generic [ref=e103]:
            - generic [ref=e104]:
              - img [ref=e106]
              - generic [ref=e108]:
                - heading "Digital / Card" [level=3] [ref=e109]
                - paragraph [ref=e110]: Accept card and bank payments
            - generic [ref=e111] [cursor=pointer]:
              - checkbox [checked]
          - generic [ref=e114]:
            - img [ref=e115]
            - generic [ref=e117]: Enabled — will appear during checkout
        - generic [ref=e118]:
          - generic [ref=e119]:
            - generic [ref=e120]:
              - img [ref=e122]
              - generic [ref=e125]:
                - heading "Cash" [level=3] [ref=e126]
                - paragraph [ref=e127]: Accept cash payments at checkout
            - generic [ref=e128] [cursor=pointer]:
              - checkbox [checked]
          - generic [ref=e131]:
            - img [ref=e132]
            - generic [ref=e134]: Enabled — will appear during checkout
        - generic [ref=e135]:
          - generic [ref=e136]:
            - generic [ref=e137]:
              - img [ref=e139]
              - generic [ref=e145]:
                - heading "UPI QR" [level=3] [ref=e146]
                - paragraph [ref=e147]: Accept UPI payments via QR code
            - generic [ref=e148] [cursor=pointer]:
              - checkbox [checked]
          - generic [ref=e151]:
            - generic [ref=e152]:
              - generic [ref=e153]: UPI ID
              - textbox "restaurant@ybl" [ref=e154]: 910623045@fam
              - generic [ref=e155]: QR code will be generated automatically during checkout
            - generic [ref=e157]:
              - img [ref=e158]
              - generic [ref=e164]: QR Preview
          - generic [ref=e165]:
            - img [ref=e166]
            - generic [ref=e168]: Enabled — will appear during checkout
```

# Test source

```ts
  1   | // TC-A3 — Payment Methods, TC-A4 — Floor Plans, TC-A5 — Sessions
  2   | import { test, expect } from '@playwright/test';
  3   | import { login } from './helpers.js';
  4   | 
  5   | // ── A3: Payment Methods ──────────────────────────────────────────────────────
  6   | test.describe('A3 — Payment Methods', () => {
  7   | 
  8   |   test.beforeEach(async ({ page }) => {
  9   |     await login(page);
  10  |     await page.locator('text=Payment Methods').first().click();
  11  |     await page.waitForTimeout(1000);
  12  |   });
  13  | 
  14  |   test('TC-A3-01: Payment Methods page loads', async ({ page }) => {
> 15  |     await expect(page.locator('text=Payment Methods, text=payment').first()).toBeVisible();
      |                                                                              ^ Error: expect(locator).toBeVisible() failed
  16  |   });
  17  | 
  18  |   test('TC-A3-02: Cash, Digital, UPI methods visible', async ({ page }) => {
  19  |     const body = await page.textContent('body');
  20  |     expect(body).toMatch(/cash/i);
  21  |     expect(body).toMatch(/digital|card|bank/i);
  22  |     expect(body).toMatch(/upi|qr/i);
  23  |   });
  24  | 
  25  |   test('TC-A3-03: Toggle switch exists for each method', async ({ page }) => {
  26  |     const toggles = page.locator('input[type="checkbox"], [class*="toggle"], [role="switch"]');
  27  |     const count = await toggles.count();
  28  |     expect(count).toBeGreaterThanOrEqual(1);
  29  |   });
  30  | 
  31  |   test('TC-A3-04: UPI ID input field exists', async ({ page }) => {
  32  |     const upiInput = page.locator('input[placeholder*="UPI" i], input[placeholder*="upi" i], input[placeholder*="@"]').first();
  33  |     const hasUpi = await upiInput.isVisible({ timeout: 3000 }).catch(() => false);
  34  |     expect(hasUpi).toBeTruthy();
  35  |   });
  36  | 
  37  | });
  38  | 
  39  | // ── A4: Floor Plans ──────────────────────────────────────────────────────────
  40  | test.describe('A4 — Floor Plans', () => {
  41  | 
  42  |   test.beforeEach(async ({ page }) => {
  43  |     await login(page);
  44  |     await page.locator('text=Floor Plans').first().click();
  45  |     await page.waitForTimeout(1200);
  46  |   });
  47  | 
  48  |   test('TC-A4-01: Floor Plans page shows floors list and table grid', async ({ page }) => {
  49  |     await expect(page.locator('text=Floor Plans').first()).toBeVisible();
  50  |     // Should have floors sidebar
  51  |     const body = await page.textContent('body');
  52  |     expect(body).toMatch(/floor|ground|terrace/i);
  53  |   });
  54  | 
  55  |   test('TC-A4-02: Table cards visible with status labels', async ({ page }) => {
  56  |     const tableCards = page.locator('[class*="table-card"], [class*="table-number"]');
  57  |     const count = await tableCards.count();
  58  |     expect(count).toBeGreaterThan(0);
  59  |   });
  60  | 
  61  |   test('TC-A4-03: Legend shows Available, Occupied, Reserved', async ({ page }) => {
  62  |     const body = await page.textContent('body');
  63  |     expect(body).toMatch(/available/i);
  64  |     expect(body).toMatch(/occupied|reserved/i);
  65  |   });
  66  | 
  67  |   test('TC-A4-04: Add Table button opens modal', async ({ page }) => {
  68  |     const addBtn = page.locator('button:has-text("Add Table")').first();
  69  |     await expect(addBtn).toBeVisible();
  70  |     await addBtn.click();
  71  |     await page.waitForTimeout(500);
  72  |     // Modal with Table Number field
  73  |     await expect(page.locator('text=Table Number').first()).toBeVisible();
  74  |     await expect(page.locator('text=Seats').first()).toBeVisible();
  75  |   });
  76  | 
  77  |   test('TC-A4-05: Add Table modal has all required fields', async ({ page }) => {
  78  |     await page.locator('button:has-text("Add Table")').first().click();
  79  |     await page.waitForTimeout(500);
  80  |     const body = await page.textContent('body');
  81  |     expect(body).toMatch(/table number/i);
  82  |     expect(body).toMatch(/seats/i);
  83  |     expect(body).toMatch(/active|appointment/i);
  84  |     // Close modal
  85  |     await page.keyboard.press('Escape');
  86  |   });
  87  | 
  88  |   test('TC-A4-06: Hover on occupied table shows Reset button', async ({ page }) => {
  89  |     const occupied = page.locator('[class*="table-occupied"]').first();
  90  |     const hasOccupied = await occupied.isVisible({ timeout: 3000 }).catch(() => false);
  91  |     if (!hasOccupied) { test.skip(); return; }
  92  | 
  93  |     await occupied.hover();
  94  |     await page.waitForTimeout(300);
  95  |     const resetBtn = occupied.locator('button:has-text("Reset")');
  96  |     await expect(resetBtn).toBeVisible({ timeout: 2000 });
  97  |   });
  98  | 
  99  | });
  100 | 
  101 | // ── A5: POS Sessions ─────────────────────────────────────────────────────────
  102 | test.describe('A5 — POS Sessions', () => {
  103 | 
  104 |   test.beforeEach(async ({ page }) => {
  105 |     await login(page);
  106 |     await page.locator('text=POS Sessions').first().click();
  107 |     await page.waitForTimeout(1000);
  108 |   });
  109 | 
  110 |   test('TC-A5-01: POS Sessions page loads', async ({ page }) => {
  111 |     const body = await page.textContent('body');
  112 |     expect(body).toMatch(/session/i);
  113 |   });
  114 | 
  115 |   test('TC-A5-02: Open POS / Open Session button is visible', async ({ page }) => {
```