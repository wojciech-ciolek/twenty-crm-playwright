import { test, expect } from '@fixtures/index';
import { graphqlRequest } from '@helpers/api/graphql.client';

test.use({ storageState: 'storage/auth.json' });

const CREATE_PERSON = `
  mutation CreatePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
      id
    }
  }
`;

test.describe('People API validation', () => {
    test(
        'should reject createPerson when the email is not a valid email address',
        { tag: '@regression' },
        async ({ page }) => {
            // Arrange
            const invalidInput = {
                name: { firstName: 'Invalid', lastName: 'Email' },
                emails: { primaryEmail: 'not-an-email' },
            };

            // Act
            const request = graphqlRequest(page, 'CreatePerson', CREATE_PERSON, { input: invalidInput });

            // Assert
            await expect(request).rejects.toThrow(/BAD_USER_INPUT/);
        },
    );
});
