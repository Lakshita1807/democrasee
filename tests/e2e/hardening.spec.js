import { test, expect } from '@playwright/test';

test.describe('DemocraSee Hardening E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Monitor for CSP violations in the console
        page.on('console', msg => {
            if (msg.type() === 'error' && msg.text().includes('CSP')) {
                throw new Error(`CSP Violation detected: ${msg.text()}`);
            }
        });

        await page.goto('/');
        const startBtn = page.locator('#get-started-btn');
        if (await startBtn.isVisible()) {
            await startBtn.click();
        }
    });

    test('should have a strict CSP header with dynamic nonce', async ({ page }) => {
        const response = await page.reload();
        const csp = response.headers()['content-security-policy'];
        expect(csp).toBeDefined();
        
        // Find the nonce in the CSP header
        const nonceMatch = csp.match(/'nonce-([^']+)'/);
        expect(nonceMatch).not.toBeNull();
        const nonce = nonceMatch[1];
        
        // Verify the inline script tag in the DOM has the SAME nonce
        const scriptNonceProperty = await page.evaluate(() => {
            const script = document.querySelector('script[nonce]');
            return script ? script.nonce : null;
        });
        expect(scriptNonceProperty).toBe(nonce);
        
        // Verify no unsafe-inline in script-src
        const scriptSrc = csp.split(';').find(s => s.trim().startsWith('script-src'));
        expect(scriptSrc).not.toContain("'unsafe-inline'");
    });

    test('should block bot submission via honeypot', async ({ page }) => {
        const initialCount = await page.locator('.message.user').count();
        await page.locator('#chat-honeypot').fill('I am a bot', { force: true });
        await page.fill('#chat-input', 'Hello?');
        await page.click('#send-btn');
        const userMessages = page.locator('.message.user');
        await expect(userMessages).toHaveCount(initialCount);
    });

    test('should show skip-to-content on tab', async ({ page }) => {
        await page.focus('body');
        await page.keyboard.press('Tab');
        const skipLink = page.locator('.skip-link');
        await expect(skipLink).toBeVisible();
    });
});
