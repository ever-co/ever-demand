import { expect, test } from '@playwright/test';

/**
 * Smoke tests that need no API: the socket.io endpoint probe (`SERVICES_ENDPOINT`) is answered
 * or refused by Playwright, so they run before the upgraded API is up.
 */
const SERVICES = process.env.E2E_SERVICES_URL || 'http://localhost:5500';

test.describe('merchant app shell', () => {
	test('boots to the login page with the default store credentials', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		await page.route(`${SERVICES}/`, (route) => route.fulfill({ status: 404, body: 'Cannot GET /' }));

		await page.goto('/');

		await expect(page).toHaveURL(/\/login$/);
		await expect(page.getByPlaceholder('Username')).toHaveValue(/.+/);
		await expect(page.getByPlaceholder('Password')).toHaveAttribute('type', 'password');
		await expect(page.locator('button.login-button')).toHaveText('Login');
		expect(errors).toEqual([]);
	});

	test('shows the server-down page when the API is unreachable', async ({ page }) => {
		await page.route(`${SERVICES}/**`, (route) => route.abort('connectionrefused'));

		await page.goto('/');

		await expect(page).toHaveURL(/\/server-down$/);
	});
});
