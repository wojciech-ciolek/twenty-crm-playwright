import { Page, Locator } from '@playwright/test';

export class PersonDetailPage {
  readonly fieldsContainer: Locator;
  readonly activeInlineEditor: Locator;
  readonly dropdownListbox: Locator;

  constructor(readonly page: Page) {
    this.fieldsContainer = page.getByTestId('record-fields-widget');
    this.activeInlineEditor = page.getByTestId('inline-cell-edit-mode-container');
    this.dropdownListbox = page.getByRole('listbox');
  }

  async goto(recordId: string): Promise<void> {
    await this.page.goto(`/object/person/${recordId}`);
  }

  // Mirrors Twenty's own RecordDetails POM: label tooltip -> sibling value container.
  getFieldValueByLabel(label: string): Locator {
    return this.page.locator(
      `//div[@data-testid='tooltip' and contains(., '${label}')]/../../../div[last()]/div/div`,
    );
  }

  getRelationSection(fieldLabel: string): Locator {
    const testId = `${fieldLabel.toLowerCase().replace(' ', '-')}-relation`;
    return this.page.getByTestId(testId);
  }

  getRelationListItems(fieldLabel: string): Locator {
    return this.getRelationSection(fieldLabel).getByTestId('record-detail-records-list-item');
  }

  getActiveInlineInput(): Locator {
    return this.activeInlineEditor.getByRole('textbox');
  }

  async openFieldEditor(label: string): Promise<void> {
    await this.getFieldValueByLabel(label).click();
  }

  async fillActiveInlineInput(value: string): Promise<void> {
    await this.getActiveInlineInput().fill(value);
  }

  async confirmActiveInlineInput(): Promise<void> {
    await this.getActiveInlineInput().press('Enter');
  }

  async editTextField(label: string, value: string): Promise<void> {
    await this.openFieldEditor(label);
    await this.fillActiveInlineInput(value);
    await this.confirmActiveInlineInput();
  }

  async selectDropdownOption(label: string, optionText: string): Promise<void> {
    await this.openFieldEditor(label);
    await this.dropdownListbox.getByText(optionText).click();
  }

  async expandRelationItem(fieldLabel: string, index = 0): Promise<void> {
    await this.getRelationListItems(fieldLabel).nth(index).getByTestId('expand-button').click();
  }
}
