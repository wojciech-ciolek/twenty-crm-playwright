import { test, expect } from '@fixtures/index';
import { PeopleListPage } from '@pages/people';

test.use({ storageState: 'storage/auth.json' });

test.describe('People list visual regression', () => {
    test('should match the people list baseline screenshot', { tag: '@regression' }, async ({ page }) => {
        // Arrange
        const peopleListPage = new PeopleListPage(page);

        // Act
        await peopleListPage.goto();
        await peopleListPage.waitForLoad();

        // Assert
        // Visual regression catches unintended UI changes (layout shifts, broken
        // styles, missing elements, CSS regressions) that functional tests miss,
        // since functional assertions only check specific testids/text rather
        // than the overall rendered appearance.
        //
        // The screenshot is clipped to the static region above the data rows –
        // top bar, "All People" sub-header, "New Person" button, column header
        // row, sidebar nav – rather than masking the table body. Each row
        // renders a relative "x days ago" creation date that changes on its own
        // as time passes, and this page is shared data: other tests running in
        // parallel create/delete records while this screenshot is taken, so
        // neither row content nor row *count* is deterministic. Masking the
        // rows (or even the footer too) isn't enough on its own: a changed row
        // count still shifts the "Add new" row and the footer summary row to a
        // different position than the baseline, producing a diff even though
        // their content never changed – and the only DOM container with a
        // fixed height that could absorb that shift also wraps the column
        // headers, so masking it would hide the very thing we want to verify.
        // Clipping sidesteps this entirely: the variable-height area is never
        // part of the captured pixels, so its position, content, or count can
        // never cause a diff.
        await expect(page).toHaveScreenshot('people-list.png', {
            clip: { x: 0, y: 0, width: 1280, height: 128 },
        });
    });
});
