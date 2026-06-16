import { test, expect } from '@fixtures/index';
import { validUser } from '@test-data/auth.data';

test.describe('Login', () => {
    test(
        'should successfully log in with valid credentials',
        { tag: '@smoke' },
        async ({ loginPage }) => {
            // Act
            await loginPage.login(validUser.email, validUser.password);

            // Assert
            await expect(loginPage.page).not.toHaveURL(/welcome/, { timeout: 10_000 });
        },
    );

    test(
        'should redirect to home page after successful login',
        { tag: '@smoke' },
        async ({ loginPage }) => {
            // Act
            await loginPage.login(validUser.email, validUser.password);

            // Assert
            await expect(loginPage.page).toHaveURL(/objects/, { timeout: 10_000 });
        },
    );

    test(
        'should show error for invalid password',
        { tag: '@regression' },
        async ({ loginPage }) => {
            // Act
            await loginPage.login(validUser.email, 'WrongPassword123!');

            // Assert
            await expect(loginPage.errorMessage).toBeVisible({ timeout: 5_000 });
            await expect(loginPage.errorMessage).toHaveText('Wrong password.');
        },
    );

    test(
        'should show Sign up button for non-existent email',
        { tag: '@regression' },
        async ({ loginPage }) => {
            // Act
            await loginPage.fillEmail('nonexistent@example.com');
            await loginPage.clickContinue();

            // Assert
            await expect(loginPage.signUpButton).toBeVisible({ timeout: 5_000 });
        },
    );
});