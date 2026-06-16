import { chromium } from '@playwright/test';
import { LoginPage } from '@pages/auth';

/**
 * Global Setup – runs once before all tests.
 *
 * Responsibilities:
 * - Logs in via UI as the test user
 * - Saves session state (cookies + localStorage) to storage/auth.json
 * - Tests reuse the saved session via test.use({ storageState: 'storage/auth.json' })
 *
 * Why UI login instead of API:
 * Twenty CRM v0.2.1 does not expose a public auth endpoint in GraphQL.
 * Logging in once via UI and reusing storageState is the standard
 * Playwright pattern for this scenario.
 *
 * This file must not contain assertions or data mutations.
 */
export default async function globalSetup() {
    const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

    const browser = await chromium.launch();
    const context = await browser.newContext({ baseURL, locale: 'en-US' });
    const page = await context.newPage();

    await page.goto('/welcome');
    await page.waitForLoadState('networkidle');

    const loginPage = new LoginPage(page);
    await loginPage.login(
        process.env.TEST_USER_EMAIL!,
        process.env.TEST_USER_PASSWORD!,
    );

    await page.waitForURL(/objects|people|companies/, { timeout: 30_000 });

    await context.storageState({ path: './storage/auth.json' });

    await browser.close();
}