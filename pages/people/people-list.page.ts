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

  // No data-testid exists for either of these; both are matched by their
  // rendered (Polish, per this workspace's language setting) text, same as
  // the existing "Delete Person" command-menu locator in PersonDetailPage.
  //
  // .first() matters here: Twenty fires one toast per failing GraphQL
  // operation, and a mocked failure typically fails both FindManyPeople and
  // AggregatePeople, so two identically-worded toasts can be on screen at
  // once. Without .first(), toBeVisible() throws a strict-mode violation
  // ("resolved to 2 elements") whenever that happens, instead of the assertion
  // it's actually meant to make: at least one error toast is visible.
  getErrorToast(): Locator {
    return this.page.getByText('Response not successful: Received status code 500').first();
  }

  getEmptyStateMessage(): Locator {
    return this.page.getByText('Nie znaleziono Person');
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('[data-testid^="row-id-"]', { timeout: 15_000 });
  }
}
