import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper: navigate past onboarding and open the Eligibility tab
// ---------------------------------------------------------------------------
async function openEligibility(page) {
    await page.goto('/');
    // Dismiss onboarding
    await page.click('#get-started-btn');
    await expect(page.locator('#main-app')).toBeVisible();
    // Open Eligibility tab
    await page.click('[data-tab="eligibility"]');
    await expect(page.locator('#tab-eligibility')).toHaveClass(/active/);
}

test.describe('Eligibility Wizard — E2E', () => {

    // ── Happy path ────────────────────────────────────────────────────────────
    test('happy path: citizen + 18+ + registered → "You are Eligible!" is visible', async ({ page }) => {
        await openEligibility(page);

        // Step 1 — Citizen: Yes
        await page.click('#elig-citizen-yes');
        await expect(page.locator('#elig-step-2')).toBeVisible();

        // Step 2 — Age slider ≥ 18 (default is 18, confirm and proceed)
        await expect(page.locator('#age-slider')).toHaveValue('18');
        await page.click('#elig-age-next');
        await expect(page.locator('#elig-step-3')).toBeVisible();

        // Step 3 — Already registered
        await page.click('[data-result="eligible-reg"]');

        // Result panel must appear with the eligible message
        await expect(page.locator('#elig-result')).toBeVisible();
        await expect(page.locator('#result-title')).toContainText('You are Eligible!');

        // Documents list must be present and non-empty
        await expect(page.locator('#result-docs')).toBeVisible();
        await expect(page.locator('#result-docs li')).not.toHaveCount(0);
    });

    // ── Sad path — not a citizen ──────────────────────────────────────────────
    test('sad path: click "No" on citizenship → flow stops, eligible message never appears', async ({ page }) => {
        await openEligibility(page);

        // Step 1 — Citizen: No
        // The "No" button has no handler — the wizard just stays on step 1.
        // Verify the eligible result is never shown.
        await page.click('#elig-citizen-no');

        // The result card must remain hidden
        await expect(page.locator('#elig-result')).toBeHidden();

        // Step 2 must also stay hidden (flow did not advance)
        await expect(page.locator('#elig-step-2')).toBeHidden();
    });

    // ── Under-18 path ─────────────────────────────────────────────────────────
    test('under-18 path: age slider below 18 → shows "Not Eligible Yet" result', async ({ page }) => {
        await openEligibility(page);

        // Step 1 — citizen: Yes
        await page.click('#elig-citizen-yes');
        await expect(page.locator('#elig-step-2')).toBeVisible();

        // Set age slider to 16
        await page.evaluate(() => {
            const slider = document.getElementById('age-slider');
            slider.value = '16';
            slider.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await expect(page.locator('#age-val')).toHaveText('16');

        // Click Next — the handler now enforces the 18-year threshold
        await page.click('#elig-age-next');

        // Result card must appear showing ineligible
        await expect(page.locator('#elig-result')).toBeVisible();
        await expect(page.locator('#result-title')).toContainText('Not Eligible Yet');

        // Step 3 must remain hidden — flow did not advance
        await expect(page.locator('#elig-step-3')).toBeHidden();

        // Documents list must be hidden for ineligible result
        await expect(page.locator('#result-docs')).toBeHidden();
    });

    // ── "Start Over" resets the form to step 1 ────────────────────────────────
    test('"Start Over" resets the form back to step 1', async ({ page }) => {
        await openEligibility(page);

        // Complete happy path to reach the result card
        await page.click('#elig-citizen-yes');
        await page.click('#elig-age-next');
        await page.click('[data-result="eligible-reg"]');
        await expect(page.locator('#elig-result')).toBeVisible();

        // Click Start Over
        await page.click('#elig-reset-btn');

        // Step 1 must be visible again
        await expect(page.locator('#elig-step-1')).toBeVisible();

        // Result card must be hidden again
        await expect(page.locator('#elig-result')).toBeHidden();

        // Age slider must be back to default (18)
        await expect(page.locator('#age-slider')).toHaveValue('18');
    });
});
