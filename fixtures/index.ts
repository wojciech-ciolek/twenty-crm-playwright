import { test as base, Page } from '@playwright/test';
import { LoginPage } from '@pages/auth';
import { validUser } from '@test-data/auth.data';
import { createPerson, deletePerson } from '@helpers/api/people.api';
import { testPerson } from '@test-data/people.data';

interface TwentyFixtures {
  authenticatedPage: Page;
  loginPage: LoginPage;
  personId: string;
}

export const test = base.extend<TwentyFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
    await use(page);
  },

  loginPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await lp.goto();
    await use(lp);
  },

  personId: async ({ page }, use) => {
    const id = await createPerson(page, testPerson);
    console.log(`[fixture] Created person: ${id}`);

    await use(id);

    await deletePerson(page, id);
    console.log(`[fixture] Deleted person: ${id}`);
  },
});

export { expect } from '@playwright/test';