import * as dotenv from 'dotenv';
dotenv.config();
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI
    ? [['html'], ['list'], ['./reporters/flaky.reporter.ts'], ['allure-playwright']]
    : [['html'], ['list'], ['allure-playwright']],
  globalSetup: './setup/global-setup.ts',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    locale: 'en-US',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  // Real records (seed data + relative "x days ago" dates, avatar colors) drift
  // a little between runs without any actual regression. threshold loosens the
  // per-pixel color sensitivity and maxDiffPixels caps the total differing area,
  // so a couple of date-string glyphs changing doesn't fail the test while a
  // genuine layout/style regression (thousands of differing pixels) still does.
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 200,
      threshold: 0.3,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
