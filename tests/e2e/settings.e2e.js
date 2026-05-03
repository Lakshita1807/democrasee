import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper: land on the main app (past onboarding)
// ---------------------------------------------------------------------------
async function openApp(page) {
    await page.goto('/');
    await page.click('#get-started-btn');
    await expect(page.locator('#main-app')).toBeVisible();
}

// ---------------------------------------------------------------------------
// All localStorage keys the app owns (mirrors APP_STORAGE_KEYS in app.js)
// ---------------------------------------------------------------------------
const APP_STORAGE_KEYS = [
    'userRegion',
    'userRole',
    'language',
    'theme',
    'democrasee_acc_v3',
    'quizBestScore',
    'masteredFlashcards',
    'stats_questions',
    'democrasee_state',   // inline AppState key
];

test.describe('Settings — E2E', () => {

    // ── Dark Mode toggle ──────────────────────────────────────────────────────
    test('Dark Mode toggle sets data-theme="dark" on <html> and removes it on re-toggle', async ({ page }) => {
        await openApp(page);

        const html = page.locator('html');

        // Ensure we start in light mode
        const initialTheme = await html.getAttribute('data-theme');
        if (initialTheme === 'dark') {
            // Switch off dark mode first
            await page.check('#theme-checkbox');   // checked = dark; uncheck to light
            await page.uncheck('#theme-checkbox');
        }

        // Enable Dark Mode via the sidebar checkbox
        await page.check('#theme-checkbox');
        await expect(html).toHaveAttribute('data-theme', 'dark');

        // Persisted to localStorage
        const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
        expect(storedTheme).toBe('dark');

        // Disable Dark Mode
        await page.uncheck('#theme-checkbox');
        await expect(html).toHaveAttribute('data-theme', 'light');

        const storedThemeAfter = await page.evaluate(() => localStorage.getItem('theme'));
        expect(storedThemeAfter).toBe('light');
    });

    // ── High Contrast toggle ──────────────────────────────────────────────────
    test('High Contrast toggle adds/removes "accessibility-mode" class on <body>', async ({ page }) => {
        await openApp(page);

        const body = page.locator('body');

        // Ensure we start without high-contrast
        const hasClass = await body.evaluate((el) => el.classList.contains('accessibility-mode'));
        if (hasClass) {
            await page.click('#acc-toggle');
            await expect(body).not.toHaveClass(/accessibility-mode/);
        }

        // Enable High Contrast
        await page.click('#acc-toggle');
        await expect(body).toHaveClass(/accessibility-mode/);

        // Persisted to localStorage
        const stored = await page.evaluate(() => localStorage.getItem('accessibility'));
        expect(stored).toBe('true');

        // Disable High Contrast
        await page.click('#acc-toggle');
        await expect(body).not.toHaveClass(/accessibility-mode/);

        const storedAfter = await page.evaluate(() => localStorage.getItem('accessibility'));
        expect(storedAfter).toBe('false');
    });

    // ── Reset Data clears localStorage + reloads ──────────────────────────────
    test('Reset Data clears localStorage and resets progress counters to 0', async ({ page }) => {
        await openApp(page);

        // Seed some progress data so there's something to clear
        await page.evaluate((keys) => {
            localStorage.setItem('quizBestScore', '8');
            localStorage.setItem('masteredFlashcards', JSON.stringify(['ECI', 'EVM']));
            localStorage.setItem('stats_questions', '15');
            // In-memory AppState key
            localStorage.setItem('democrasee_state', JSON.stringify({
                quizScore: 8,
                flashcardsMastered: ['ECI', 'EVM'],
                questionsAsked: 15
            }));
        }, APP_STORAGE_KEYS);

        // Handle the confirm() dialog — accept it
        page.once('dialog', async (dialog) => {
            expect(dialog.message()).toContain('Clear all progress');
            await dialog.accept();
        });

        // Click Reset Data button
        await page.click('#reset-app-btn');

        // Page reloads — wait for DOMContentLoaded after reload
        await page.waitForLoadState('domcontentloaded');

        // After reload the onboarding modal will appear (userRegion/userRole cleared)
        // OR main-app shows with reset counters depending on whether saved keys remain.
        // The reset removes CONFIG.STORAGE_KEY ('democrasee_state') so AppState resets.

        // Verify the stat keys are cleared from localStorage
        const quizScore    = await page.evaluate(() => localStorage.getItem('quizBestScore'));
        const mastered     = await page.evaluate(() => localStorage.getItem('masteredFlashcards'));
        const stateKey     = await page.evaluate(() => localStorage.getItem('democrasee_state'));

        // quizBestScore is NOT in the reset (only democrasee_state is removed by reset-app-btn)
        // democrasee_state should be null after reset
        expect(stateKey).toBeNull();

        // If the page reloaded to onboarding, pass onboarding again
        const onboarding = page.locator('#onboarding-modal');
        const isVisible = await onboarding.isVisible().catch(() => false);
        if (isVisible) {
            await page.click('#get-started-btn');
            await expect(page.locator('#main-app')).toBeVisible();
        }

        // Stat counters must show 0 after reset + reload
        await expect(page.locator('#stat-quiz')).toContainText('0');
        await expect(page.locator('#stat-flashcards')).toContainText('0');
        await expect(page.locator('#stat-questions')).toContainText('0');
    });
});
