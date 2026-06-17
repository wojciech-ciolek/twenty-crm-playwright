import { Page, Locator } from '@playwright/test';
import { urls } from '@config/urls';

export class LoginPage {
  readonly emailInput: Locator;
  readonly continueButton: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly signUpButton: Locator;
  readonly noAccessMessage: Locator;

  constructor(readonly page: Page) {
    this.emailInput = page.getByPlaceholder('Email');
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    this.passwordInput = page.getByPlaceholder('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in', exact: true });
    this.errorMessage = page.getByRole('status').first();
    this.signUpButton = page.getByRole('button', { name: 'Sign up', exact: true });
    this.noAccessMessage = page.getByRole('status', { name: /User does not have access to/i });
  }

  async goto(): Promise<void> {
    await this.page.goto(urls.login);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.clickContinue();
    await this.fillPassword(password);
    await this.clickSubmit();
  }
}