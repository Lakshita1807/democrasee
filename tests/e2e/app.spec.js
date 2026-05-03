import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('DemocraSee App Flows', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Eligibility flow', async ({ page }) => {
    // Onboarding
    await page.selectOption('#state-select', 'Maharashtra');
    await page.selectOption('#role-select', 'First-time Voter');
    await page.click('#get-started-btn');

    // Go to Eligibility tab
    await page.click('[data-tab="eligibility"]');
    
    // Step 1: Citizen
    await page.click('#elig-citizen-yes');
    
    // Step 2: Age
    await page.fill('#age-slider', '18');
    await page.click('#elig-age-next');
    
    // Step 3: Registered
    await page.click('text=already registered');
    
    // Verify result
    await expect(page.locator('#result-title')).toBeVisible();
  });

  test('Quiz flow', async ({ page }) => {
    await page.click('#get-started-btn');
    await page.click('[data-tab="quiz"]');
    await page.click('text=Start Quiz');
    
    // Answer all questions (just pick first option for simplicity)
    for (let i = 0; i < 10; i++) {
      const opt = page.locator('.quiz-opt').first();
      if (await opt.isVisible()) {
          await opt.click();
          await page.click('text=/Next Question|See Results/');
      }
    }
  });

  test('Language switch', async ({ page }) => {
    await page.click('button[data-lang="HI"]');
    await expect(page.locator('#get-started-btn')).toContainText('शुरू करें');
    
    await page.click('button[data-lang="EN"]');
    await expect(page.locator('#get-started-btn')).toContainText('Get Started');
  });

  test('AI assistant', async ({ page }) => {
    await page.click('#get-started-btn');
    await page.fill('#chat-input', 'What is an EVM?');
    await page.click('#send-btn');
    
    // Wait for response
    const aiMessage = page.locator('.message.ai');
    await expect(aiMessage).toBeVisible({ timeout: 15000 });
  });

  test('Accessibility check', async ({ page }) => {
    await page.click('#get-started-btn');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['critical', 'serious'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
