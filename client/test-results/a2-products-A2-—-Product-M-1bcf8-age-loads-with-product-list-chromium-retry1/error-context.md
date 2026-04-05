# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a2-products.spec.js >> A2 — Product Management >> TC-A2-01: Products page loads with product list
- Location: e2e\a2-products.spec.js:13:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: h1:has-text("Product"), h1:has-text("product"), text=Products >> nth=0
Expected: visible
Error: Unexpected token "=" while parsing css selector "h1:has-text("Product"), h1:has-text("product"), text=Products". Did you mean to CSS.escape it?

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for h1:has-text("Product"), h1:has-text("product"), text=Products >> nth=0

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
      - link "Products" [active] [ref=e26] [cursor=pointer]:
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
          - heading "Products" [level=1] [ref=e99]
          - paragraph [ref=e100]: 27 items in your menu
        - button "Add Product" [ref=e101] [cursor=pointer]:
          - img [ref=e102]
          - text: Add Product
      - generic [ref=e103]:
        - generic [ref=e104]:
          - img
          - textbox "Search products..." [ref=e105]
        - generic [ref=e106]:
          - button "All" [ref=e107] [cursor=pointer]
          - button "Coffee & Tea" [ref=e108] [cursor=pointer]
          - button "Signature Pizza" [ref=e109] [cursor=pointer]
          - button "Pasta" [ref=e110] [cursor=pointer]
          - button "Starters" [ref=e111] [cursor=pointer]
          - button "Vino" [ref=e112] [cursor=pointer]
          - button "Desserts" [ref=e113] [cursor=pointer]
          - button "Drinks" [ref=e114] [cursor=pointer]
        - generic [ref=e115]:
          - button [ref=e116] [cursor=pointer]:
            - img [ref=e117]
          - button [ref=e119] [cursor=pointer]:
            - img [ref=e120]
      - generic [ref=e121]:
        - generic [ref=e122] [cursor=pointer]:
          - img "Oat Milk Cortado" [ref=e124]
          - generic [ref=e125]:
            - generic [ref=e126]: Coffee & Tea
            - heading "Oat Milk Cortado" [level=3] [ref=e127]
            - paragraph [ref=e128]: Double shot, silky microfoam
            - generic [ref=e129]:
              - generic [ref=e130]: $4.50
              - generic [ref=e131]:
                - button [ref=e132]:
                  - img [ref=e133]
                - button [ref=e136]:
                  - img [ref=e137]
        - generic [ref=e140] [cursor=pointer]:
          - img "Signature Cold Brew" [ref=e142]
          - generic [ref=e143]:
            - generic [ref=e144]: Starters
            - heading "Signature Cold Brew" [level=3] [ref=e145]
            - paragraph [ref=e146]: 24hr cold brewed, smooth finish
            - generic [ref=e147]:
              - generic [ref=e148]: $100.03
              - generic [ref=e149]:
                - button [ref=e150]:
                  - img [ref=e151]
                - button [ref=e154]:
                  - img [ref=e155]
        - generic [ref=e158] [cursor=pointer]:
          - img "Cappuccino" [ref=e160]
          - generic [ref=e161]:
            - generic [ref=e162]: Coffee & Tea
            - heading "Cappuccino" [level=3] [ref=e163]
            - paragraph [ref=e164]: Classic Italian, perfect foam art
            - generic [ref=e165]:
              - generic [ref=e166]: $4.00
              - generic [ref=e167]:
                - button [ref=e168]:
                  - img [ref=e169]
                - button [ref=e172]:
                  - img [ref=e173]
        - generic [ref=e176] [cursor=pointer]:
          - img "Matcha Latte" [ref=e178]
          - generic [ref=e179]:
            - generic [ref=e180]: Coffee & Tea
            - heading "Matcha Latte" [level=3] [ref=e181]
            - paragraph [ref=e182]: Ceremonial grade, oat milk
            - generic [ref=e183]:
              - generic [ref=e184]: $5.00
              - generic [ref=e185]:
                - button [ref=e186]:
                  - img [ref=e187]
                - button [ref=e190]:
                  - img [ref=e191]
        - generic [ref=e194] [cursor=pointer]:
          - img "Earl Grey" [ref=e196]
          - generic [ref=e197]:
            - generic [ref=e198]: Coffee & Tea
            - heading "Earl Grey" [level=3] [ref=e199]
            - paragraph [ref=e200]: Organic bergamot infusion
            - generic [ref=e201]:
              - generic [ref=e202]: $3.50
              - generic [ref=e203]:
                - button [ref=e204]:
                  - img [ref=e205]
                - button [ref=e208]:
                  - img [ref=e209]
        - generic [ref=e212] [cursor=pointer]:
          - img "Espresso Macchiato" [ref=e214]
          - generic [ref=e215]:
            - generic [ref=e216]: Coffee & Tea
            - heading "Espresso Macchiato" [level=3] [ref=e217]
            - paragraph [ref=e218]: Single origin, caramel dot
            - generic [ref=e219]:
              - generic [ref=e220]: $3.00
              - generic [ref=e221]:
                - button [ref=e222]:
                  - img [ref=e223]
                - button [ref=e226]:
                  - img [ref=e227]
        - generic [ref=e230] [cursor=pointer]:
          - img "Wild Truffle Pizza" [ref=e232]
          - generic [ref=e233]:
            - generic [ref=e234]: Signature Pizza
            - heading "Wild Truffle Pizza" [level=3] [ref=e235]
            - paragraph [ref=e236]: Buffalo mozzarella, fresh thyme
            - generic [ref=e237]:
              - generic [ref=e238]: $18.90
              - generic [ref=e239]:
                - button [ref=e240]:
                  - img [ref=e241]
                - button [ref=e244]:
                  - img [ref=e245]
        - generic [ref=e248] [cursor=pointer]:
          - img "Margherita Pizza" [ref=e250]
          - generic [ref=e251]:
            - generic [ref=e252]: Signature Pizza
            - heading "Margherita Pizza" [level=3] [ref=e253]
            - paragraph [ref=e254]: Fresh basil, san marzano
            - generic [ref=e255]:
              - generic [ref=e256]: $14.00
              - generic [ref=e257]:
                - button [ref=e258]:
                  - img [ref=e259]
                - button [ref=e262]:
                  - img [ref=e263]
        - generic [ref=e266] [cursor=pointer]:
          - img "Quattro Formaggi" [ref=e268]
          - generic [ref=e269]:
            - generic [ref=e270]: Signature Pizza
            - heading "Quattro Formaggi" [level=3] [ref=e271]
            - paragraph [ref=e272]: Four cheese blend, honey drizzle
            - generic [ref=e273]:
              - generic [ref=e274]: $17.50
              - generic [ref=e275]:
                - button [ref=e276]:
                  - img [ref=e277]
                - button [ref=e280]:
                  - img [ref=e281]
        - generic [ref=e284] [cursor=pointer]:
          - img "Prosciutto e Rucola" [ref=e286]
          - generic [ref=e287]:
            - generic [ref=e288]: Signature Pizza
            - heading "Prosciutto e Rucola" [level=3] [ref=e289]
            - paragraph [ref=e290]: Aged prosciutto, wild arugula
            - generic [ref=e291]:
              - generic [ref=e292]: $19.00
              - generic [ref=e293]:
                - button [ref=e294]:
                  - img [ref=e295]
                - button [ref=e298]:
                  - img [ref=e299]
        - generic [ref=e302] [cursor=pointer]:
          - img "Pesto Tagliatelle" [ref=e304]
          - generic [ref=e305]:
            - generic [ref=e306]: Pasta
            - heading "Pesto Tagliatelle" [level=3] [ref=e307]
            - paragraph [ref=e308]: House-made, toasted pine nuts
            - generic [ref=e309]:
              - generic [ref=e310]: $16.00
              - generic [ref=e311]:
                - button [ref=e312]:
                  - img [ref=e313]
                - button [ref=e316]:
                  - img [ref=e317]
        - generic [ref=e320] [cursor=pointer]:
          - img "Truffle Risotto" [ref=e322]
          - generic [ref=e323]:
            - generic [ref=e324]: Pasta
            - heading "Truffle Risotto" [level=3] [ref=e325]
            - paragraph [ref=e326]: Arborio, parmesan, black truffle
            - generic [ref=e327]:
              - generic [ref=e328]: $18.00
              - generic [ref=e329]:
                - button [ref=e330]:
                  - img [ref=e331]
                - button [ref=e334]:
                  - img [ref=e335]
        - generic [ref=e338] [cursor=pointer]:
          - img "Aglio Olio" [ref=e340]
          - generic [ref=e341]:
            - generic [ref=e342]: Pasta
            - heading "Aglio Olio" [level=3] [ref=e343]
            - paragraph [ref=e344]: Garlic, chilli flakes, parsley
            - generic [ref=e345]:
              - generic [ref=e346]: $13.00
              - generic [ref=e347]:
                - button [ref=e348]:
                  - img [ref=e349]
                - button [ref=e352]:
                  - img [ref=e353]
        - generic [ref=e356] [cursor=pointer]:
          - img "Caesar Salad" [ref=e358]
          - generic [ref=e359]:
            - generic [ref=e360]: Starters
            - heading "Caesar Salad" [level=3] [ref=e361]
            - paragraph [ref=e362]: Romaine, croutons, anchovy dressing
            - generic [ref=e363]:
              - generic [ref=e364]: $12.00
              - generic [ref=e365]:
                - button [ref=e366]:
                  - img [ref=e367]
                - button [ref=e370]:
                  - img [ref=e371]
        - generic [ref=e374] [cursor=pointer]:
          - img "Bruschetta" [ref=e376]
          - generic [ref=e377]:
            - generic [ref=e378]: Starters
            - heading "Bruschetta" [level=3] [ref=e379]
            - paragraph [ref=e380]: Heirloom tomato, basil on sourdough
            - generic [ref=e381]:
              - generic [ref=e382]: $9.00
              - generic [ref=e383]:
                - button [ref=e384]:
                  - img [ref=e385]
                - button [ref=e388]:
                  - img [ref=e389]
        - generic [ref=e392] [cursor=pointer]:
          - img "Burrata Salad" [ref=e394]
          - generic [ref=e395]:
            - generic [ref=e396]: Starters
            - heading "Burrata Salad" [level=3] [ref=e397]
            - paragraph [ref=e398]: Creamy burrata, heirloom tomatoes
            - generic [ref=e399]:
              - generic [ref=e400]: $14.00
              - generic [ref=e401]:
                - button [ref=e402]:
                  - img [ref=e403]
                - button [ref=e406]:
                  - img [ref=e407]
        - generic [ref=e410] [cursor=pointer]:
          - img "Classic Negroni" [ref=e412]
          - generic [ref=e413]:
            - generic [ref=e414]: Vino
            - heading "Classic Negroni" [level=3] [ref=e415]
            - paragraph [ref=e416]: Gin, Vermouth, Campari
            - generic [ref=e417]:
              - generic [ref=e418]: $14.00
              - generic [ref=e419]:
                - button [ref=e420]:
                  - img [ref=e421]
                - button [ref=e424]:
                  - img [ref=e425]
        - generic [ref=e428] [cursor=pointer]:
          - img "Provence Rosé" [ref=e430]
          - generic [ref=e431]:
            - generic [ref=e432]: Vino
            - heading "Provence Rosé" [level=3] [ref=e433]
            - paragraph [ref=e434]: Crisp, notes of strawberry
            - generic [ref=e435]:
              - generic [ref=e436]: $12.00
              - generic [ref=e437]:
                - button [ref=e438]:
                  - img [ref=e439]
                - button [ref=e442]:
                  - img [ref=e443]
        - generic [ref=e446] [cursor=pointer]:
          - img "Barolo Reserve" [ref=e448]
          - generic [ref=e449]:
            - generic [ref=e450]: Vino
            - heading "Barolo Reserve" [level=3] [ref=e451]
            - paragraph [ref=e452]: Full-bodied, oak-aged Italian red
            - generic [ref=e453]:
              - generic [ref=e454]: $22.00
              - generic [ref=e455]:
                - button [ref=e456]:
                  - img [ref=e457]
                - button [ref=e460]:
                  - img [ref=e461]
        - generic [ref=e464] [cursor=pointer]:
          - img "Aperol Spritz" [ref=e466]
          - generic [ref=e467]:
            - generic [ref=e468]: Vino
            - heading "Aperol Spritz" [level=3] [ref=e469]
            - paragraph [ref=e470]: Classic Italian aperitif
            - generic [ref=e471]:
              - generic [ref=e472]: $11.00
              - generic [ref=e473]:
                - button [ref=e474]:
                  - img [ref=e475]
                - button [ref=e478]:
                  - img [ref=e479]
        - generic [ref=e482] [cursor=pointer]:
          - img "Ganache Tart" [ref=e484]
          - generic [ref=e485]:
            - generic [ref=e486]: Desserts
            - heading "Ganache Tart" [level=3] [ref=e487]
            - paragraph [ref=e488]: 70% Dark chocolate, sea salt
            - generic [ref=e489]:
              - generic [ref=e490]: $9.50
              - generic [ref=e491]:
                - button [ref=e492]:
                  - img [ref=e493]
                - button [ref=e496]:
                  - img [ref=e497]
        - generic [ref=e500] [cursor=pointer]:
          - img "Tiramisu" [ref=e502]
          - generic [ref=e503]:
            - generic [ref=e504]: Desserts
            - heading "Tiramisu" [level=3] [ref=e505]
            - paragraph [ref=e506]: Mascarpone, espresso, cocoa
            - generic [ref=e507]:
              - generic [ref=e508]: $8.50
              - generic [ref=e509]:
                - button [ref=e510]:
                  - img [ref=e511]
                - button [ref=e514]:
                  - img [ref=e515]
        - generic [ref=e518] [cursor=pointer]:
          - img "Panna Cotta" [ref=e520]
          - generic [ref=e521]:
            - generic [ref=e522]: Desserts
            - heading "Panna Cotta" [level=3] [ref=e523]
            - paragraph [ref=e524]: Vanilla bean, berry compote
            - generic [ref=e525]:
              - generic [ref=e526]: $8.00
              - generic [ref=e527]:
                - button [ref=e528]:
                  - img [ref=e529]
                - button [ref=e532]:
                  - img [ref=e533]
        - generic [ref=e536] [cursor=pointer]:
          - img "Crème Brûlée" [ref=e538]
          - generic [ref=e539]:
            - generic [ref=e540]: Desserts
            - heading "Crème Brûlée" [level=3] [ref=e541]
            - paragraph [ref=e542]: Tahitian vanilla, caramelized sugar
            - generic [ref=e543]:
              - generic [ref=e544]: $9.00
              - generic [ref=e545]:
                - button [ref=e546]:
                  - img [ref=e547]
                - button [ref=e550]:
                  - img [ref=e551]
        - generic [ref=e554] [cursor=pointer]:
          - img "Sparkling Water" [ref=e556]
          - generic [ref=e557]:
            - generic [ref=e558]: Drinks
            - heading "Sparkling Water" [level=3] [ref=e559]
            - paragraph [ref=e560]: San Pellegrino, 500ml
            - generic [ref=e561]:
              - generic [ref=e562]: $3.50
              - generic [ref=e563]:
                - button [ref=e564]:
                  - img [ref=e565]
                - button [ref=e568]:
                  - img [ref=e569]
        - generic [ref=e572] [cursor=pointer]:
          - img "Fresh Orange Juice" [ref=e574]
          - generic [ref=e575]:
            - generic [ref=e576]: Drinks
            - heading "Fresh Orange Juice" [level=3] [ref=e577]
            - paragraph [ref=e578]: Squeezed to order
            - generic [ref=e579]:
              - generic [ref=e580]: $5.00
              - generic [ref=e581]:
                - button [ref=e582]:
                  - img [ref=e583]
                - button [ref=e586]:
                  - img [ref=e587]
        - generic [ref=e590] [cursor=pointer]:
          - img "Craft Lemonade" [ref=e592]
          - generic [ref=e593]:
            - generic [ref=e594]: Drinks
            - heading "Craft Lemonade" [level=3] [ref=e595]
            - paragraph [ref=e596]: Rosemary and honey
            - generic [ref=e597]:
              - generic [ref=e598]: $4.50
              - generic [ref=e599]:
                - button [ref=e600]:
                  - img [ref=e601]
                - button [ref=e604]:
                  - img [ref=e605]
```

# Test source

```ts
  1  | // TC-A2 — Product Management Tests
  2  | import { test, expect } from '@playwright/test';
  3  | import { login } from './helpers.js';
  4  | 
  5  | test.describe('A2 — Product Management', () => {
  6  | 
  7  |   test.beforeEach(async ({ page }) => {
  8  |     await login(page);
  9  |     await page.locator('text=Products').first().click();
  10 |     await page.waitForTimeout(1000);
  11 |   });
  12 | 
  13 |   test('TC-A2-01: Products page loads with product list', async ({ page }) => {
  14 |     await expect(page.locator('h1:has-text("Product"), h1:has-text("product")'
> 15 |       + ', text=Products').first()).toBeVisible();
     |                                     ^ Error: expect(locator).toBeVisible() failed
  16 |     // At least one product shown
  17 |     const rows = page.locator('table tbody tr, .product-card, [class*="product-row"]');
  18 |     const count = await rows.count();
  19 |     expect(count).toBeGreaterThan(0);
  20 |   });
  21 | 
  22 |   test('TC-A2-02: Add new product modal opens', async ({ page }) => {
  23 |     const addBtn = page.locator('button:has-text("Add Product"), button:has-text("New Product"), button:has-text("Add")').first();
  24 |     await addBtn.click();
  25 |     await page.waitForTimeout(500);
  26 |     // Modal should appear with name field
  27 |     await expect(page.locator('input[placeholder*="name" i], input[placeholder*="Name"]').first()).toBeVisible();
  28 |   });
  29 | 
  30 |   test('TC-A2-03: Product list shows name, price, category columns', async ({ page }) => {
  31 |     // Check table headers or card info
  32 |     const pageText = await page.textContent('body');
  33 |     const hasPrice = pageText.includes('$') || pageText.includes('Price') || pageText.includes('price');
  34 |     expect(hasPrice).toBeTruthy();
  35 |   });
  36 | 
  37 |   test('TC-A2-04: Search/filter products works', async ({ page }) => {
  38 |     const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="Search"]').first();
  39 |     if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
  40 |       await searchInput.fill('Coffee');
  41 |       await page.waitForTimeout(600);
  42 |       const pageText = await page.textContent('body');
  43 |       // Either products match or "no results" shows
  44 |       expect(pageText.toLowerCase()).toMatch(/coffee|no product|no result/i);
  45 |     } else {
  46 |       test.skip();
  47 |     }
  48 |   });
  49 | 
  50 |   test('TC-A2-05: Edit product button exists in product list', async ({ page }) => {
  51 |     const editBtn = page.locator('button[aria-label*="edit" i], button:has-text("Edit"), [class*="edit"]').first();
  52 |     const hasEdit = await editBtn.isVisible({ timeout: 3000 }).catch(() => false);
  53 |     // Edit might be in a row action
  54 |     const moreOptions = page.locator('[class*="action"], button[aria-label*="more" i]').first();
  55 |     const hasMore = await moreOptions.isVisible({ timeout: 2000 }).catch(() => false);
  56 |     expect(hasEdit || hasMore).toBeTruthy();
  57 |   });
  58 | 
  59 | });
  60 | 
```