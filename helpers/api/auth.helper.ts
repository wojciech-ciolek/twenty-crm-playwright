import { Page } from '@playwright/test';

interface TokenPair {
    accessOrWorkspaceAgnosticToken: {
        token: string;
    };
}

/**
 * Extracts the JWT access token from the tokenPair cookie.
 * Twenty CRM stores auth state as a URL-encoded JSON cookie.
 */
export async function getAccessToken(page: Page): Promise<string> {
    const context = page.context();
    const cookies = await context.cookies();

    const tokenPairCookie = cookies.find((cookie) => cookie.name === 'tokenPair');

    if (!tokenPairCookie) {
        throw new Error('tokenPair cookie not found – is the user logged in?');
    }

    const decoded: TokenPair = JSON.parse(decodeURIComponent(tokenPairCookie.value));

    return decoded.accessOrWorkspaceAgnosticToken.token;
}
