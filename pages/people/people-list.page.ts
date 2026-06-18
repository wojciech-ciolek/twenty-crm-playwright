import { Page, Locator } from '@playwright/test';
import { urls } from '@config/urls';

export class PeopleListPage {
  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(urls.people);
  }

  getRowByRecordId(recordId: string): Locator {
    return this.page.getByTestId(`row-id-${recordId}`);
  }

  async openRecordById(recordId: string): Promise<void> {
    await this.getRowByRecordId(recordId).locator('a').first().click();
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('[data-testid^="row-id-"]', { timeout: 15_000 });
  }
}
