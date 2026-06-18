import { test, expect } from '@fixtures/index';
import { PersonDetailPage } from '@pages/people';
import { updatedPerson } from '@test-data/people.data';

test.use({ storageState: 'storage/auth.json' });

test.describe('Person edit', () => {
    test('should update person first name', { tag: '@regression' }, async ({ page, personId }) => {
        // Arrange – person created by fixture via API
        const personDetailPage = new PersonDetailPage(page);
        await personDetailPage.goto(personId);

        // Act
        await personDetailPage.editFirstName(updatedPerson.firstName!);

        // Assert
        await expect(personDetailPage.nameHeader).toContainText(updatedPerson.firstName!, {
            timeout: 10_000,
        });
    });
});
