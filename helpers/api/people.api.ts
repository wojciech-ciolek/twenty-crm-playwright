import { Page } from '@playwright/test';
import { graphqlRequest } from './graphql.client';

export interface PersonInput {
    firstName: string;
    lastName: string;
}

const CREATE_PERSON = `
  mutation CreatePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
      id
      name {
        firstName
        lastName
      }
    }
  }
`;

const DELETE_PERSON = `
  mutation DeletePerson($id: String!) {
    deletePerson(id: $id) {
      id
    }
  }
`;

/**
 * Creates a person via GraphQL API.
 * Returns the created person's ID for use in test cleanup.
 */
export async function createPerson(page: Page, input: PersonInput): Promise<string> {
    const data = await graphqlRequest(page, 'CreatePerson', CREATE_PERSON, {
        input: {
            name: {
                firstName: input.firstName,
                lastName: input.lastName,
            },
        },
    });

    return (data.createPerson as { id: string }).id;
}

/**
 * Deletes a person via GraphQL API.
 * Used in fixture teardown to clean up test data.
 */
export async function deletePerson(page: Page, id: string): Promise<void> {
    await graphqlRequest(page, 'DeletePerson', DELETE_PERSON, { id });
}
