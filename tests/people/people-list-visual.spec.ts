import { test, expect } from '@fixtures/index';
import { PeopleListPage } from '@pages/people';

test.use({ storageState: 'storage/auth.json' });

test.describe('People list visual regression', () => {
    test('should match the people list baseline screenshot', { tag: '@regression' }, async ({ page }) => {
        // Arrange
        const peopleListPage = new PeopleListPage(page);

        // Act
        await peopleListPage.goto();
        await peopleListPage.waitForLoad();

        // Assert
        // Visual regression catches unintended UI changes (layout shifts, broken
        // styles, missing elements, CSS regressions) that functional tests miss,
        // since functional assertions only check specific testids/text rather
        // than the overall rendered appearance. The diff tolerance is configured
        // globally (see playwright.config.ts) to absorb harmless pixel drift from
        // dynamic content – relative "x days ago" dates, avatar colors – without
        // masking real regressions.
        await expect(page).toHaveScreenshot('people-list.png');
    });
});
