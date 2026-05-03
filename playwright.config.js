import { defineConfig, devices } from '@playwright/test';

/**
 * Live Cloud Run URL — the canonical target for E2E tests.
 * Override with PLAYWRIGHT_BASE_URL env var if needed (e.g. staging or local).
 */
const LIVE_URL = 'https://democrasee-142760811225.us-central1.run.app';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || LIVE_URL;
const isLive = baseURL === LIVE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Give live network a bit more headroom
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Only spin up a local server when NOT targeting the live URL
  ...(!isLive && {
    webServer: {
      command: 'npm start',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
    },
  }),
});
