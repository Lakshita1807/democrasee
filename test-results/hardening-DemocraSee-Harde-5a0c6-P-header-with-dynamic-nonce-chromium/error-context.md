# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: hardening.spec.js >> DemocraSee Hardening E2E >> should have a strict CSP header with dynamic nonce
- Location: tests\e2e\hardening.spec.js:12:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "G20e6UVYBpbXoUzvnw6i5g=="
Received: "{{CSP_NONCE}}"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e4]:
    - generic [ref=e5]: 96.8 Crore registered voters in India 2024
    - generic [ref=e7]: 66.3% national voter turnout in 2024
    - generic [ref=e9]: 543 Lok Sabha seats contested
    - generic [ref=e11]: 74 women elected to Lok Sabha in 2024
    - generic [ref=e13]: 7 phases of polling in 2024
    - generic [ref=e15]: Indelible ink used since 1962
    - generic [ref=e17]: EVM introduced nationally in 2004
  - dialog "Welcome to DemocraSee" [ref=e20]:
    - generic [ref=e21]:
      - heading "Welcome to DemocraSee" [level=1] [ref=e24]
      - paragraph [ref=e25]: Your Smart Election Guide
    - generic [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]: Select Your State/UT
        - combobox "Select Your State/UT" [ref=e29]:
          - option "All India (National)" [selected]
          - option "Andhra Pradesh"
          - option "Arunachal Pradesh"
          - option "Assam"
          - option "Bihar"
          - option "Chhattisgarh"
          - option "Goa"
          - option "Gujarat"
          - option "Haryana"
          - option "Himachal Pradesh"
          - option "Jharkhand"
          - option "Karnataka"
          - option "Kerala"
          - option "Madhya Pradesh"
          - option "Maharashtra"
          - option "Manipur"
          - option "Meghalaya"
          - option "Mizoram"
          - option "Nagaland"
          - option "Odisha"
          - option "Punjab"
          - option "Rajasthan"
          - option "Sikkim"
          - option "Tamil Nadu"
          - option "Telangana"
          - option "Tripura"
          - option "Uttar Pradesh"
          - option "Uttarakhand"
          - option "West Bengal"
          - option "Andaman and Nicobar Islands"
          - option "Chandigarh"
          - option "Dadra and Nagar Haveli and Daman and Diu"
          - option "Delhi"
          - option "Jammu and Kashmir"
          - option "Ladakh"
          - option "Lakshadweep"
          - option "Puducherry"
      - generic [ref=e30]:
        - generic [ref=e31]: Tell us your goal
        - combobox "Tell us your goal" [ref=e32]:
          - option "I'm a first-time voter" [selected]
          - option "I'm a student doing research"
          - option "I'm helping others vote"
          - option "I'm just curious"
      - generic [ref=e33]:
        - generic [ref=e34]: Preferred Language
        - generic [ref=e35]:
          - button "EN" [ref=e36] [cursor=pointer]
          - button "हिंदी" [ref=e37] [cursor=pointer]
          - button "தமிழ்" [ref=e38] [cursor=pointer]
          - button "বাংলা" [ref=e39] [cursor=pointer]
      - button "Get Started" [ref=e40] [cursor=pointer]: Get Started
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('DemocraSee Hardening E2E', () => {
  4  |     test.beforeEach(async ({ page }) => {
  5  |         await page.goto('/');
  6  |         const startBtn = page.locator('#get-started-btn');
  7  |         if (await startBtn.isVisible()) {
  8  |             await startBtn.click();
  9  |         }
  10 |     });
  11 | 
  12 |     test('should have a strict CSP header with dynamic nonce', async ({ page }) => {
  13 |         const response = await page.goto('/');
  14 |         const csp = response.headers()['content-security-policy'];
  15 |         expect(csp).toBeDefined();
  16 |         
  17 |         // Find the nonce in the CSP header
  18 |         const nonceMatch = csp.match(/'nonce-([^']+)'/);
  19 |         expect(nonceMatch).not.toBeNull();
  20 |         const nonce = nonceMatch[1];
  21 |         
  22 |         // Verify the inline script tag in the DOM has the SAME nonce
  23 |         const scriptNonce = await page.locator('script[nonce]').getAttribute('nonce');
  24 |         // Note: Some browsers hide the nonce attribute in the DOM for security, 
  25 |         // but it should match the property.
  26 |         const scriptNonceProperty = await page.evaluate(() => document.querySelector('script[nonce]').nonce);
> 27 |         expect(scriptNonceProperty).toBe(nonce);
     |                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  28 |         
  29 |         const scriptSrc = csp.split(';').find(s => s.trim().startsWith('script-src'));
  30 |         expect(scriptSrc).not.toContain("'unsafe-inline'");
  31 |     });
  32 | 
  33 |     test('should block bot submission via honeypot', async ({ page }) => {
  34 |         const initialCount = await page.locator('.message.user').count();
  35 |         await page.locator('#chat-honeypot').fill('I am a bot', { force: true });
  36 |         await page.fill('#chat-input', 'Hello?');
  37 |         await page.click('#send-btn');
  38 |         const userMessages = page.locator('.message.user');
  39 |         await expect(userMessages).toHaveCount(initialCount);
  40 |     });
  41 | 
  42 |     test('should show skip-to-content on tab', async ({ page }) => {
  43 |         await page.focus('body');
  44 |         await page.keyboard.press('Tab');
  45 |         const skipLink = page.locator('.skip-link');
  46 |         await expect(skipLink).toBeVisible();
  47 |     });
  48 | });
  49 | 
```