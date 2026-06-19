import { Page, Locator } from '@playwright/test';

export class CompanyDetailPage {
  readonly fieldsContainer: Locator;
  readonly nameHeader: Locator;

  constructor(readonly page: Page) {
    this.fieldsContainer = page.getByTestId('record-fields-widget');
    this.nameHeader = page.getByTestId('top-bar-title');
  }

  async goto(recordId: string): Promise<void> {
    await this.page.goto(`/object/company/${recordId}`);
  }

  // Related people are rendered as named "chip" elements inside the
  // company's relation widget – there is no stable testid per relation
  // row, so we locate the chip by the related person's display name.
  getRelatedPersonChip(personName: string): Locator {
    return this.page.getByTestId('chip').filter({ hasText: personName });
  }
}
