import { test, expect } from '@fixtures/index';

test.use({ storageState: 'storage/auth.json' });

test.describe('People', () => {
    test(
        'should display created person in the list',
        { tag: '@smoke' },
        async ({ page, personId }) => {
            // Arrange – person created by fixture via API

            // Act
            await page.goto('/objects/people');

            // Assert
            await expect(page.getByText('Test Portfolio')).toBeVisible();

            console.log('Person ID from fixture:', personId);
        },
    );
});