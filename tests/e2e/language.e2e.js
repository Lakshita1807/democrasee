import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper: land on the app (past onboarding)
// ---------------------------------------------------------------------------
async function openApp(page) {
    await page.goto('/');
    await page.click('#get-started-btn');
    await expect(page.locator('#main-app')).toBeVisible();
}

// ---------------------------------------------------------------------------
// Language switching uses [data-i18n="tagline"] on the onboarding modal p-tag
// and the same element in the multilingual settings panel lang-cards.
// The tagline is the most stable text anchor for language verification.
// ---------------------------------------------------------------------------
test.describe('Language Switching — E2E', () => {

    // ── Switch to हिंदी ───────────────────────────────────────────────────────
    test('switching to हिंदी sets tagline to "आपका स्मार्ट चुनाव गाइड"', async ({ page }) => {
        await page.goto('/');

        // Switch language BEFORE dismissing onboarding (lang-btn is on the modal)
        await page.click('button[data-lang="HI"]');

        // The [data-i18n="tagline"] element should now show the Hindi tagline
        await expect(page.locator('[data-i18n="tagline"]'))
            .toContainText('आपका स्मार्ट चुनाव गाइड', { timeout: 8000 });
    });

    // ── Switch to தமிழ் ───────────────────────────────────────────────────────
    test('switching to தமிழ் sets tagline to "உங்கள் தேர்தல் வழிகாட்டி"', async ({ page }) => {
        await page.goto('/');

        await page.click('button[data-lang="TA"]');

        await expect(page.locator('[data-i18n="tagline"]'))
            .toContainText('உங்கள் தேர்தல் வழிகாட்டி', { timeout: 8000 });
    });

    // ── Switch to বাংলা ───────────────────────────────────────────────────────
    test('switching to বাংলা sets tagline to "আপনার স্মার্ট নির্বাচন গাইড"', async ({ page }) => {
        await page.goto('/');

        await page.click('button[data-lang="BN"]');

        await expect(page.locator('[data-i18n="tagline"]'))
            .toContainText('আপনার স্মার্ট নির্বাচন গাইড', { timeout: 8000 });
    });

    // ── Switching language after quiz progress does not reset score ────────────
    test('switching language does not reset quiz score to 0', async ({ page }) => {
        await openApp(page);

        // Inject a fake quiz score into localStorage and AppState so we have
        // something to verify across the language switch
        await page.evaluate(() => {
            localStorage.setItem('quizBestScore', '7');
            // Also set the in-memory AppState used by the inline script
            const s = JSON.parse(localStorage.getItem('democrasee_state') || '{}');
            s.quizScore = 7;
            localStorage.setItem('democrasee_state', JSON.stringify(s));
            // Trigger updateUI if AppState is exposed
            if (window.AppState) window.AppState.load();
        });

        // Read the sidebar stat before switching language
        const statBefore = await page.locator('#stat-quiz').textContent();

        // Navigate to the multilingual settings panel
        await page.click('[data-tab="multilingual"]');

        // Click हिंदी lang-card in the settings grid
        await page.click('#settings-lang-grid [data-lang="HI"]');

        // Give the language switch a moment to apply
        await page.waitForTimeout(1000);

        // Quiz stat in sidebar must NOT have reset to 0/10
        const statAfter = await page.locator('#stat-quiz').textContent();
        expect(statAfter).not.toBe('0/10');

        // The score stored in localStorage must still be 7
        const stored = await page.evaluate(() => localStorage.getItem('quizBestScore'));
        expect(stored).toBe('7');
    });
});
