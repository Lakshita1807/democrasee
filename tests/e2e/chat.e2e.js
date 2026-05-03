import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper: land on the assistant tab (default tab after onboarding)
// ---------------------------------------------------------------------------
async function openChat(page) {
    await page.goto('/');
    await page.click('#get-started-btn');
    await expect(page.locator('#main-app')).toBeVisible();
    // Assistant tab is active by default — confirm chat input is present
    await expect(page.locator('#chat-input')).toBeVisible();
}

test.describe('Chat / AI Assistant — E2E', () => {

    // ── Empty send does nothing ────────────────────────────────────────────────
    test('clicking Send with empty input does nothing — no response element appears', async ({ page }) => {
        await openChat(page);

        // Ensure input is empty
        await page.locator('#chat-input').fill('');

        // Count existing messages before clicking Send
        const initialCount = await page.locator('#chat-messages .message').count();

        await page.click('#send-btn');

        // Wait a moment to confirm nothing was added
        await page.waitForTimeout(1500);

        const afterCount = await page.locator('#chat-messages .message').count();
        expect(afterCount).toBe(initialCount);

        // Typing indicator must also remain hidden
        await expect(page.locator('#typing-indicator')).toHaveClass(/hidden/);
    });

    // ── 600-char input is capped at 500 by maxlength ─────────────────────────
    test('typing 600 characters is capped at 500 by the maxlength attribute', async ({ page }) => {
        await openChat(page);

        const input = page.locator('#chat-input');

        // Verify the HTML attribute
        await expect(input).toHaveAttribute('maxlength', '500');

        // Type 600 characters
        const longText = 'A'.repeat(600);
        await input.fill(longText);

        // The browser enforces maxlength — value length must be ≤ 500
        const actualLength = await input.evaluate((el) => el.value.length);
        expect(actualLength).toBeLessThanOrEqual(500);

        // char-counter must show 500 / 500
        await expect(page.locator('#char-counter')).toContainText('500');

        // Counter must have the "limit" class applied
        await expect(page.locator('#char-counter')).toHaveClass(/limit/);
    });

    // ── Valid message gets a response ─────────────────────────────────────────
    test('a valid message gets a response rendered in the chat area', async ({ page }) => {
        await openChat(page);

        // Type and send a question
        await page.fill('#chat-input', 'What is an EVM?');
        await page.click('#send-btn');

        // User message must appear immediately
        await expect(page.locator('#chat-messages .message.user')).toBeVisible();
        await expect(page.locator('#chat-messages .message.user')).toContainText('What is an EVM?');

        // Wait for AI response (network call to /chat-endpoint)
        const aiMessage = page.locator('#chat-messages .message.ai');
        await expect(aiMessage).toBeVisible({ timeout: 20_000 });

        // Typing indicator must be hidden once response is rendered
        await expect(page.locator('#typing-indicator')).toHaveClass(/hidden/);
    });
});
