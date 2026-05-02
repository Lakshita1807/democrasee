const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

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
    await page.click('text=Am I Eligible?');
    
    // Step 1: Citizen
    await page.click('text=Yes, I am 🇮🇳');
    
    // Step 2: Age
    await page.fill('#age-slider', '18');
    await page.click('text=Next Step →');
    
    // Step 3: Registered
    await page.click('text=Yes, already registered');
    
    // Verify result
    await expect(page.locator('#result-title')).toContainText('Ready to Vote');
  });

  test('Quiz flow', async ({ page }) => {
    await page.click('#get-started-btn');
    await page.click('text=Master Election Quiz');
    await page.click('text=Start Quiz →');
    
    // Answer all questions (just pick first option for simplicity)
    for (let i = 0; i < 10; i++) {
      await page.click('.quiz-opt >> nth=0');
      await page.click('text=/Next Question|See Results/');
    }
    
    await expect(page.locator('.quiz-results h2')).toContainText('You scored');
  });

  test('Language switch', async ({ page }) => {
    await page.click('text=हिंदी');
    await expect(page.locator('#get-started-btn')).toContainText('शुरू करें');
    
    await page.click('text=EN');
    await expect(page.locator('#get-started-btn')).toContainText('Get Started');
  });

  test('AI assistant', async ({ page }) => {
    await page.click('#get-started-btn');
    await page.fill('#chat-input', 'What is an EVM?');
    await page.click('#send-btn');
    
    // Wait for response
    const aiMessage = page.locator('.message.ai');
    await expect(aiMessage).toBeVisible({ timeout: 15000 });
    const text = await aiMessage.innerText();
    expect(text.length).toBeGreaterThan(0);
  });

  test('Accessibility check', async ({ page }) => {
    await page.click('#get-started-btn');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['critical', 'serious'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
