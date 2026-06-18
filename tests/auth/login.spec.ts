import { test, expect } from '@fixtures/index';
import { validUser, invalidUser, wrongPassword } from '@test-data/auth.data';

test.describe('Login', () => {
    test('should successfully log in with valid credentials', { tag: '@smoke' }, async ({ loginPage }) => {
        // Act
        await loginPage.login(validUser.email, validUser.password);

        // Assert
        await expect(loginPage.page).toHaveURL(/objects/, { timeout: 10_000 });
    });

    test('should show error for invalid password', { tag: '@regression' }, async ({ loginPage }) => {
        // Act
        await loginPage.login(validUser.email, wrongPassword);

        // Assert
        await expect(loginPage.errorMessage).toBeVisible({ timeout: 5_000 });
        await expect(loginPage.errorMessage).toHaveText('Wrong password.');
    });

    test(
        'should show error when trying to sign up with non-existent email',
        { tag: '@regression' },
        async ({ loginPage }) => {
            // Act
            await loginPage.fillEmail(invalidUser.email);
            await loginPage.clickContinue();
            await loginPage.fillPassword(invalidUser.password);
            await loginPage.signUpButton.click();

            // Assert
            await expect(loginPage.noAccessMessage).toBeVisible({ timeout: 5_000 });
        },
    );
});
