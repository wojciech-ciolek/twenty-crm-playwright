import { Page, Locator } from '@playwright/test';

export class PersonDetailPage {
  readonly fieldsContainer: Locator;
  readonly activeInlineEditor: Locator;
  readonly dropdownListbox: Locator;
  readonly nameHeader: Locator;
  readonly sidePanelButton: Locator;
  readonly deletePersonMenuItem: Locator;

  constructor(readonly page: Page) {
    this.fieldsContainer = page.getByTestId('record-fields-widget');
    this.activeInlineEditor = page.getByTestId('inline-cell-edit-mode-container');
    this.dropdownListbox = page.getByRole('listbox');
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

  async selectDropdownOption(label: string, optionText: string): Promise<void> {
    await this.openFieldEditor(label);
    await this.dropdownListbox.getByText(optionText).click();
  }

  async expandRelationItem(fieldLabel: string, index = 0): Promise<void> {
    await this.getRelationListItems(fieldLabel).nth(index).getByTestId('expand-button').click();
  }

  async openSidePanel(): Promise<void> {
    await this.sidePanelButton.click();
  }

  async deletePerson(): Promise<void> {
    await this.openSidePanel();
    await this.deletePersonMenuItem.click();
  }
}
