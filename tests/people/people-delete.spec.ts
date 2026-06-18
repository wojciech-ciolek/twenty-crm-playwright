import { test, expect } from '@fixtures/index';
import { PeopleListPage, PersonDetailPage } from '@pages/people';

test.use({ storageState: 'storage/auth.json' });

test.describe('Person delete', () => {
    test(
        'should remove person from the list after deleting via UI',
        { tag: '@regression' },
        async ({ page, personId }) => {
            // Arrange – person created by fixture via API
            const personDetailPage = new PersonDetailPage(page);
            const peopleListPage = new PeopleListPage(page);
            await personDetailPage.goto(personId);

            // Act
            await personDetailPage.deletePerson();

            // Assert
            await peopleListPage.goto();
            await expect(peopleListPage.getRowByRecordId(personId)).toHaveCount(0, {
                timeout: 10_000,
            });
        },
    );
});
