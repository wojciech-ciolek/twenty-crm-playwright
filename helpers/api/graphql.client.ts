import { Page } from '@playwright/test';
import { getAccessToken } from './auth.helper';

const GRAPHQL_URL = '/graphql';

/**
 * Sends an authenticated GraphQL request using the current page's session.
 * Token is extracted from the tokenPair cookie set during global setup.
 */
export async function graphqlRequest(
    page: Page,
    operationName: string,
    query: string,
    variables?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
    const token = await getAccessToken(page);

    const response = await page.request.post(GRAPHQL_URL, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        data: {
            operationName,
            query,
            variables,
        },
    });

    if (!response.ok()) {
        throw new Error(
            `GraphQL request failed: ${response.status()} ${response.statusText()}`,
        );
    }

    const body = await response.json();

    if (body.errors) {
        throw new Error(
            `GraphQL errors: ${JSON.stringify(body.errors, null, 2)}`,
        );
    }

    return body.data;
}