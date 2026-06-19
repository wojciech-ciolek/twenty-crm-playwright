import { test, expect } from '@fixtures/index';
import { CompanyDetailPage } from '@pages/companies';
import { PersonDetailPage } from '@pages/people';
import { linkPersonToCompany } from '@helpers/api/people.api';
import { testPerson } from '@test-data/people.data';
import { testCompany } from '@test-data/companies.data';

test.use({ storageState: 'storage/auth.json' });

test.describe('Person-Company relation', () => {
    test(
        'should show the linked person on the company page and the linked company on the person page',
        { tag: '@regression' },
        async ({ page, personId, companyId }) => {
            // Arrange test data
            let companyDetailPage: CompanyDetailPage;
            let personDetailPage: PersonDetailPage;
            await test.step('Arrange test data', async () => {
                // personId and companyId are created independently via fixtures
                companyDetailPage = new CompanyDetailPage(page);
                personDetailPage = new PersonDetailPage(page);
            });

            // Act
            await test.step('Link person to company via API', async () => {
                await linkPersonToCompany(page, personId, companyId);
            });

            // Assert
            await test.step('Verify relation in company detail page', async () => {
                await companyDetailPage.goto(companyId);
                const personName = `${testPerson.firstName} ${testPerson.lastName}`;
                await expect(companyDetailPage.getRelatedPersonChip(personName)).toBeVisible({
                    timeout: 10_000,
                });
            });

            await test.step('Verify relation in person detail page', async () => {
                await personDetailPage.goto(personId);
                await expect(personDetailPage.getRelatedCompanyChip(testCompany.name)).toBeVisible({
                    timeout: 10_000,
                });
            });
        },
    );
});
