import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/auth';
import { createPerson, deletePerson } from '@helpers/api/people.api';
import { testPerson } from '@test-data/people.data';

interface TwentyFixtures {
  loginPage: LoginPage;
  personId: string;
}

export const test = base.extend<TwentyFixtures>({
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
