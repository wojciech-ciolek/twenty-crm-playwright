import { test, expect } from '@fixtures/index';
import { PeopleListPage, PersonDetailPage } from '@pages/people';

test.use({ storageState: 'storage/auth.json' });

test.describe('Person detail', () => {
    test(
        'should display person detail page fields',
        { tag: '@smoke' },
        async ({ page, personId }) => {
            // Arrange – person created by fixture via API
            const peopleListPage = new PeopleListPage(page);
            const personDetailPage = new PersonDetailPage(page);
            await peopleListPage.goto();

            // Act
            await peopleListPage.openRecordById(personId);

            // Assert
            await expect(personDetailPage.fieldsContainer).toBeVisible({ timeout: 10_000 });
        },
    );
});
