import { test, expect } from '@fixtures/index';
import { invalidLoginAttempts } from '@test-data/auth.data';

test.describe('Login validation', () => {
    for (const attempt of invalidLoginAttempts) {
        test(`should reject login with ${attempt.description}`, { tag: '@regression' }, async ({ loginPage }) => {
            // Arrange – loginPage fixture has already navigated to the login screen

            // Act
            await loginPage.fillEmail(attempt.email);
            await loginPage.clickContinue();

            // Assert
            if (attempt.expectedBehavior === 'continueError') {
                await expect(loginPage.errorMessage).toHaveText(attempt.expectedError!, { timeout: 5_000 });
                return;
            }

            await loginPage.fillPassword(attempt.password);
            await expect(loginPage.submitButton).toBeDisabled();
        });
    }
});
