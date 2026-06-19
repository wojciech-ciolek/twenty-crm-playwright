import { Page } from '@playwright/test';
import { graphqlRequest } from './graphql.client';

export interface CompanyInput {
    name: string;
}

const CREATE_COMPANY = `
  mutation CreateCompany($input: CompanyCreateInput!) {
    createCompany(data: $input) {
      id
      name
    }
  }
`;

const DELETE_COMPANY = `
  mutation DeleteCompany($id: String!) {
    deleteCompany(id: $id) {
      id
    }
  }
`;

/**
 * Creates a company via GraphQL API.
 * Returns the created company's ID for use in test cleanup.
 */
export async function createCompany(page: Page, input: CompanyInput): Promise<string> {
    const data = await graphqlRequest(page, 'CreateCompany', CREATE_COMPANY, {
        input: {
            name: input.name,
        },
    });

    return (data.createCompany as { id: string }).id;
}

/**
 * Deletes a company via GraphQL API.
 * Used in fixture teardown to clean up test data.
 */
export async function deleteCompany(page: Page, id: string): Promise<void> {
    await graphqlRequest(page, 'DeleteCompany', DELETE_COMPANY, { id });
}
