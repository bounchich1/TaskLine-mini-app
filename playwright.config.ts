import { defineConfig, devices } from '@playwright/test';

const PORT = 5174;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: 'ru-RU',
    timezoneId: 'Asia/Krasnoyarsk',
    trace: 'retain-on-failure',
  },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002 } },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: process.env.PLAYWRIGHT_CHANNEL },
    },
  ],
  webServer: {
    command: `npx vite --mode demo --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 60000,
  },
});
