import { Page, Locator } from '@playwright/test';
import { urls } from '@config/urls';

export class PeopleListPage {
  readonly createNewPersonButton: Locator;
  readonly activeCellEditor: Locator;

  constructor(readonly page: Page) {
    this.createNewPersonButton = page.getByRole('button', { name: 'Create new Person' });
    this.activeCellEditor = page.getByTestId('editable-cell-edit-mode-container');
  }

  async goto(): Promise<void> {
    await this.page.goto(urls.people);
  }

  getRowByRecordId(recordId: string): Locator {
    return this.page.getByTestId(`row-id-${recordId}`);
  }

  getRowByName(fullName: string): Locator {
    return this.page.locator('[data-testid^="row-id-"]').filter({ hasText: fullName });
  }

  getCellDisplay(recordId: string): Locator {
    return this.getRowByRecordId(recordId).getByTestId('editable-cell-display-mode');
  }

  async clickCreateNewPerson(): Promise<void> {
    await this.createNewPersonButton.click();
  }

  async openRecordById(recordId: string): Promise<void> {
    await this.getRowByRecordId(recordId).locator('a').first().click();
  }

  async openRecordByName(fullName: string): Promise<void> {
    await this.getRowByName(fullName).locator('a').first().click();
  }

  async openCellEditorByRowAndText(recordId: string, cellText: string): Promise<void> {
    await this.getRowByRecordId(recordId).getByText(cellText, { exact: false }).click();
  }

  async fillActiveCellEditor(value: string): Promise<void> {
    await this.activeCellEditor.getByRole('textbox').fill(value);
  }

  async confirmActiveCellEditor(): Promise<void> {
    await this.activeCellEditor.getByRole('textbox').press('Enter');
  }
  async waitForLoad(): Promise<void> {
    await this.page.getByTestId(/^row-id-/).first().waitFor({ state: 'visible', timeout: 15_000 });
  }
}
