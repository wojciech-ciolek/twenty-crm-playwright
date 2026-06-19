import { Page, Locator } from '@playwright/test';

export class PersonDetailPage {
  readonly fieldsContainer: Locator;
  readonly nameHeader: Locator;
  readonly sidePanelButton: Locator;
  readonly deletePersonMenuItem: Locator;

  constructor(readonly page: Page) {
    this.fieldsContainer = page.getByTestId('record-fields-widget');
    // The page header title cell renders the person's full name and, when
    // clicked, swaps in the first/last name inline editor in place.
    this.nameHeader = page.getByTestId('top-bar-title');
    this.sidePanelButton = page.getByTestId('page-header-side-panel-button');
    // "Delete Person" isn't a pinned header action; it only appears once the
    // side panel's "Other" command list is opened.
    this.deletePersonMenuItem = page.getByText('Delete Person', { exact: true });
  }

  async goto(recordId: string): Promise<void> {
    await this.page.goto(`/object/person/${recordId}`);
  }

  getNameHeaderInputs(): Locator {
    return this.nameHeader.getByRole('textbox');
  }

  async openNameEditor(): Promise<void> {
    await this.nameHeader.click();
  }

  async editFirstName(value: string): Promise<void> {
    await this.openNameEditor();
    const firstNameInput = this.getNameHeaderInputs().first();
    await firstNameInput.fill(value);
    await firstNameInput.press('Enter');
  }

  async openSidePanel(): Promise<void> {
    await this.sidePanelButton.click();
  }

  async deletePerson(): Promise<void> {
    await this.openSidePanel();
    await this.deletePersonMenuItem.click();
  }

  // The linked company is rendered as a named "chip" element both inside the
  // fields widget and in a separate relation panel below it. There is no
  // stable testid per relation, so we scope to the fields widget – the
  // canonical single-value display – and match by the company's name.
  getRelatedCompanyChip(companyName: string): Locator {
    return this.fieldsContainer.getByTestId('chip').filter({ hasText: companyName });
  }
}
