import { chromium } from '@playwright/test';
import { LoginPage } from '@pages/auth';

/**
 * Global Setup – runs once before all tests.
 *
 * Responsibilities:
 * - Ensures the test user exists (creates via UI signup if needed)
 * - Logs in and saves session state to storage/auth.json
 * - Tests reuse the saved session via test.use({ storageState: 'storage/auth.json' })
 *
 * User provisioning strategy:
 * This setup uses a service container (fresh Twenty CRM instance per CI run),
 * so the test user must be created on first run. It attempts login first;
 * if the user doesn't exist, it registers via the UI signup flow.
 *
 * In a real production project, a persistent staging environment would be used
 * instead — the test user would be created once by an admin and credentials
 * stored in secrets. The seed-on-CI approach here trades simplicity for
 * full pipeline isolation (no external environment dependency).
 *
 * This file must not contain assertions or business data mutations.
 */
export default async function globalSetup() {
    const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
    const email = process.env.TEST_USER_EMAIL!;
    const password = process.env.TEST_USER_PASSWORD!;

    const browser = await chromium.launch();
    const context = await browser.newContext({ baseURL, locale: 'en-US' });
    const page = await context.newPage();

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.fillEmail(email);
    await loginPage.clickContinue();

    const signUpButton = page.getByRole('button', { name: 'Sign up', exact: true });

    if (await signUpButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
        console.log('[globalSetup] User not found – registering via signup flow...');
        await loginPage.fillPassword(password);
        await signUpButton.click();

        await page.waitForURL(/verify|objects|people|companies/, { timeout: 60_000 });

        if (page.url().includes('verify')) {
            await page.waitForURL(/objects|people|companies/, { timeout: 30_000 });
        }

        console.log('[globalSetup] Registration complete.');
    } else {
        await loginPage.fillPassword(password);
        await loginPage.clickSubmit();
        await page.waitForURL(/objects|people|companies/, { timeout: 30_000 });
    }

    await context.storageState({ path: './storage/auth.json' });
    await browser.close();

    console.log('[globalSetup] Session saved to storage/auth.json');
}