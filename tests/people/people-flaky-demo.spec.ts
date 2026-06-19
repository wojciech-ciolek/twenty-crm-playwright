import { test, expect } from '@fixtures/index';
import { PeopleListPage } from '@pages/people';

test.use({ storageState: 'storage/auth.json' });

/**
 * DEMO ONLY – intentionally flaky test that demonstrates FlakyReporter
 * in action. Not part of @smoke or @regression suites.
 *
 * Uses an unrealistically short timeout that sometimes catches the table
 * before Twenty CRM finishes rendering rows, causing intermittent failures
 * that pass on retry – exactly the signature FlakyReporter is designed to
 * detect and track.
 *
 * Run it yourself:
 *   npx playwright test tests/people/people-flaky-demo.spec.ts \
 *     --repeat-each=10 --retries=2 --config playwright.config.ci.ts
 *   npm run dashboard
 *   open flaky-report/index.html
 */
test.describe('People (flaky demo)', () => {
    test(
        'should load people list quickly',
        { tag: '@flaky-demo' },
        async ({ page }) => {
            const peopleListPage = new PeopleListPage(page);
            await peopleListPage.goto();

            // Intentionally too short – Twenty CRM's table sometimes renders
            // slower than this, causing intermittent timeouts.
            await page.waitForSelector('[data-testid^="row-id-"]', { timeout: 1_500 });
        },
    );
});