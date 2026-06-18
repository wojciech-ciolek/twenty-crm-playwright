import { test, expect } from '@fixtures/index';
import { PeopleListPage } from '@pages/people';

test.use({ storageState: 'storage/auth.json' });

test.describe('People', () => {
    test(
        'should display created person in the list',
        { tag: '@smoke' },
        async ({ page, personId }) => {
            // Arrange – person created by fixture via API
            const peopleListPage = new PeopleListPage(page);

            // Act
            await peopleListPage.goto();
            await peopleListPage.waitForLoad();

            // Assert
            await expect(peopleListPage.getRowByRecordId(personId)).toHaveCount(1);
        },
    );
});