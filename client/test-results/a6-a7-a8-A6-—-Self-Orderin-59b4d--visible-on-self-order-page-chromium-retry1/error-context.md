# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a6-a7-a8.spec.js >> A6 — Self Ordering >> TC-A6-02: Table selection visible on self order page
- Location: e2e\a6-a7-a8.spec.js:19:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: [class*="table"], text=Table >> nth=0
Expected: visible
Error: Unexpected token "=" while parsing css selector "[class*="table"], text=Table". Did you mean to CSS.escape it?

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for [class*="table"], text=Table >> nth=0

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
      - link "Self Ordering" [active] [ref=e46] [cursor=pointer]:
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
        - heading "Self Ordering" [level=1] [ref=e99]
        - paragraph [ref=e100]: Let customers order from their phones via QR code
      - generic [ref=e101]:
        - generic [ref=e104]:
          - heading "Self Ordering is Active" [level=3] [ref=e105]
          - paragraph [ref=e106]: Customers can scan QR codes to browse menu and place orders
        - generic [ref=e107] [cursor=pointer]:
          - checkbox [checked]
      - generic [ref=e110]:
        - generic [ref=e111]:
          - heading "📱 Menu QR Code" [level=3] [ref=e112]
          - img [ref=e114]
          - paragraph [ref=e432]: Print this QR code and place it on tables
          - button "Download / Print" [ref=e433] [cursor=pointer]:
            - img [ref=e434]
            - text: Download / Print
          - generic [ref=e440]:
            - textbox [ref=e441]: http://localhost:5173/self-order/menu
            - button "Copy" [ref=e442] [cursor=pointer]:
              - img [ref=e443]
              - text: Copy
        - generic [ref=e446]:
          - heading "Configuration" [level=3] [ref=e447]:
            - img [ref=e448]
            - text: Configuration
          - generic [ref=e451]:
            - generic [ref=e452]: Welcome Message
            - textbox [ref=e453]: Welcome! Browse our menu and order from your seat.
          - generic [ref=e454]:
            - generic [ref=e455]: Order Instructions
            - textbox [ref=e456]: After placing your order, our staff will serve it to your table.
          - generic [ref=e457]:
            - generic [ref=e458]:
              - generic [ref=e459]: Require Table Selection
              - generic [ref=e460]: Customers must select their table number before ordering
            - generic [ref=e461] [cursor=pointer]:
              - checkbox [checked]
          - generic [ref=e464]:
            - generic [ref=e465]:
              - generic [ref=e466]: Show Price on Menu
              - generic [ref=e467]: Display product prices on the self-ordering menu
            - generic [ref=e468] [cursor=pointer]:
              - checkbox [checked]
      - generic [ref=e471]:
        - heading "Table Assignment" [level=3] [ref=e472]:
          - img [ref=e473]
          - text: Table Assignment
        - paragraph [ref=e476]: Select which tables are available for self-ordering (20 of 20 selected)
        - generic [ref=e477]:
          - button "Table 01" [ref=e478] [cursor=pointer]:
            - img [ref=e479]
            - text: Table 01
          - button "Table 02" [ref=e481] [cursor=pointer]:
            - img [ref=e482]
            - text: Table 02
          - button "Table 03" [ref=e484] [cursor=pointer]:
            - img [ref=e485]
            - text: Table 03
          - button "Table 04" [ref=e487] [cursor=pointer]:
            - img [ref=e488]
            - text: Table 04
          - button "Table 05" [ref=e490] [cursor=pointer]:
            - img [ref=e491]
            - text: Table 05
          - button "Table 06" [ref=e493] [cursor=pointer]:
            - img [ref=e494]
            - text: Table 06
          - button "Table 07" [ref=e496] [cursor=pointer]:
            - img [ref=e497]
            - text: Table 07
          - button "Table 08" [ref=e499] [cursor=pointer]:
            - img [ref=e500]
            - text: Table 08
          - button "Table 09" [ref=e502] [cursor=pointer]:
            - img [ref=e503]
            - text: Table 09
          - button "Table 10" [ref=e505] [cursor=pointer]:
            - img [ref=e506]
            - text: Table 10
          - button "Table 11" [ref=e508] [cursor=pointer]:
            - img [ref=e509]
            - text: Table 11
          - button "Table 12" [ref=e511] [cursor=pointer]:
            - img [ref=e512]
            - text: Table 12
          - button "Table 13" [ref=e514] [cursor=pointer]:
            - img [ref=e515]
            - text: Table 13
          - button "Table 14" [ref=e517] [cursor=pointer]:
            - img [ref=e518]
            - text: Table 14
          - button "Table 15" [ref=e520] [cursor=pointer]:
            - img [ref=e521]
            - text: Table 15
          - button "Table 16" [ref=e523] [cursor=pointer]:
            - img [ref=e524]
            - text: Table 16
          - button "Table 17" [ref=e526] [cursor=pointer]:
            - img [ref=e527]
            - text: Table 17
          - button "Table 18" [ref=e529] [cursor=pointer]:
            - img [ref=e530]
            - text: Table 18
          - button "Table 19" [ref=e532] [cursor=pointer]:
            - img [ref=e533]
            - text: Table 19
          - button "Table 20" [ref=e535] [cursor=pointer]:
            - img [ref=e536]
            - text: Table 20
      - generic [ref=e538]:
        - paragraph [ref=e539]:
          - img [ref=e540]
          - text: Preview how customers will see the menu
        - link "Preview Menu" [ref=e542] [cursor=pointer]:
          - /url: /self-order/menu
          - img [ref=e543]
          - text: Preview Menu
```

# Test source

```ts
  1   | // TC-A6 — Self Ordering, TC-A7 — Kitchen Display, TC-A8 — Dashboard & Reports
  2   | import { test, expect } from '@playwright/test';
  3   | import { login } from './helpers.js';
  4   | 
  5   | // ── A6: Self Ordering ────────────────────────────────────────────────────────
  6   | test.describe('A6 — Self Ordering', () => {
  7   | 
  8   |   test.beforeEach(async ({ page }) => {
  9   |     await login(page);
  10  |     await page.locator('text=Self Ordering').first().click();
  11  |     await page.waitForTimeout(1200);
  12  |   });
  13  | 
  14  |   test('TC-A6-01: Self Ordering page loads', async ({ page }) => {
  15  |     const body = await page.textContent('body');
  16  |     expect(body).toMatch(/self.order|self order|table|menu/i);
  17  |   });
  18  | 
  19  |   test('TC-A6-02: Table selection visible on self order page', async ({ page }) => {
  20  |     // Should show tables or table selector
  21  |     const tableEl = page.locator('[class*="table"], text=Table').first();
> 22  |     await expect(tableEl).toBeVisible({ timeout: 5000 });
      |                           ^ Error: expect(locator).toBeVisible() failed
  23  |   });
  24  | 
  25  |   test('TC-A6-03: Menu products displayed in self order', async ({ page }) => {
  26  |     // Try clicking first table
  27  |     const tableBtn = page.locator('[class*="table-card"], button:has-text("Table")').first();
  28  |     if (await tableBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  29  |       await tableBtn.click();
  30  |       await page.waitForTimeout(800);
  31  |     }
  32  |     const body = await page.textContent('body');
  33  |     // Should show menu items or products
  34  |     expect(body).toMatch(/cappuccino|coffee|pizza|menu|product/i);
  35  |   });
  36  | 
  37  | });
  38  | 
  39  | // ── A7: Kitchen Display ───────────────────────────────────────────────────────
  40  | test.describe('A7 — Kitchen Display', () => {
  41  | 
  42  |   test.beforeEach(async ({ page }) => {
  43  |     await login(page);
  44  |     await page.locator('text=Kitchen Display').first().click();
  45  |     await page.waitForTimeout(1200);
  46  |   });
  47  | 
  48  |   test('TC-A7-01: Kitchen Display page loads', async ({ page }) => {
  49  |     await expect(page.locator('text=Kitchen Display').first()).toBeVisible();
  50  |   });
  51  | 
  52  |   test('TC-A7-02: Three stage columns visible (TO COOK, PREPARING, COMPLETED)', async ({ page }) => {
  53  |     const body = await page.textContent('body');
  54  |     expect(body).toMatch(/to cook|cook/i);
  55  |     expect(body).toMatch(/preparing/i);
  56  |     expect(body).toMatch(/completed/i);
  57  |   });
  58  | 
  59  |   test('TC-A7-03: Active order count shown per column', async ({ page }) => {
  60  |     // Column headers should have counts
  61  |     const cookHeader = page.locator('text=TO COOK').first();
  62  |     await expect(cookHeader).toBeVisible();
  63  |     const prepHeader = page.locator('text=PREPARING').first();
  64  |     await expect(prepHeader).toBeVisible();
  65  |   });
  66  | 
  67  |   test('TC-A7-04: Ticket cards show order number and table info', async ({ page }) => {
  68  |     const tickets = page.locator('[class*="ticket"], [class*="kitchen-ticket"]');
  69  |     const count = await tickets.count();
  70  |     if (count > 0) {
  71  |       const ticketText = await tickets.first().textContent();
  72  |       expect(ticketText).toMatch(/#\d+|Table/i);
  73  |     } else {
  74  |       // No tickets is valid — just check columns exist
  75  |       const body = await page.textContent('body');
  76  |       expect(body).toMatch(/to cook/i);
  77  |     }
  78  |   });
  79  | 
  80  | });
  81  | 
  82  | // ── A8: Dashboard & Reports ───────────────────────────────────────────────────
  83  | test.describe('A8 — Dashboard', () => {
  84  | 
  85  |   test.beforeEach(async ({ page }) => {
  86  |     await login(page);
  87  |     await page.locator('text=Dashboard').first().click();
  88  |     await page.waitForTimeout(1500);
  89  |   });
  90  | 
  91  |   test('TC-A8-01: Dashboard loads with 4 stat cards', async ({ page }) => {
  92  |     await expect(page.locator("text=Today's Revenue").first()).toBeVisible();
  93  |     await expect(page.locator('text=Orders Today').first()).toBeVisible();
  94  |     await expect(page.locator('text=Active Tables').first()).toBeVisible();
  95  |     await expect(page.locator('text=Avg Order Value').first()).toBeVisible();
  96  |   });
  97  | 
  98  |   test('TC-A8-02: Last updated timestamp shows after load', async ({ page }) => {
  99  |     await page.waitForTimeout(2000);
  100 |     const body = await page.textContent('body');
  101 |     expect(body).toMatch(/last updated|welcome/i);
  102 |   });
  103 | 
  104 |   test('TC-A8-03: Refresh button exists and works', async ({ page }) => {
  105 |     const refreshBtn = page.locator('button:has-text("Refresh")').first();
  106 |     await expect(refreshBtn).toBeVisible();
  107 |     await refreshBtn.click();
  108 |     await page.waitForTimeout(1500);
  109 |     // Button should return to normal state
  110 |     await expect(refreshBtn).toBeVisible();
  111 |   });
  112 | 
  113 |   test('TC-A8-04: Sales This Week chart renders', async ({ page }) => {
  114 |     const chart = page.locator('text=Sales This Week').first();
  115 |     await expect(chart).toBeVisible();
  116 |     // Bar chart elements should exist
  117 |     const bars = page.locator('[class*="bar"], svg rect').first();
  118 |     const hasBars = await bars.isVisible({ timeout: 3000 }).catch(() => false);
  119 |     expect(hasBars).toBeTruthy();
  120 |   });
  121 | 
  122 |   test('TC-A8-05: Payment Methods donut chart renders', async ({ page }) => {
```