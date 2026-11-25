import { expect, test } from '@playwright/test';

/**
 * Smoke tests that need no API: the socket.io endpoint probe (`SERVICES_ENDPOINT`) is answered
 * or refused by Playwright, so they run before the upgraded API is up.
 */
const SERVICES = process.env.E2E_SERVICES_URL || 'http://localhost:5500';

test.describe('carrier app shell', () => {
	test('boots to the login page with the default credentials', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));

		// the app probes the API with a plain GET before it shows the pages
		await page.route(`${SERVICES}/`, (route) => route.fulfill({ status: 404, body: 'Cannot GET /' }));

		await page.goto('/');

		await expect(page).toHaveURL(/\/login$/);
		await expect(page.locator('#username')).toHaveValue(/.+/);
		await expect(page.locator('#password')).toHaveAttribute('type', 'password');
		await expect(page.locator('button.login-button')).toHaveText('Login');
		await expect(page.locator('ion-menu')).toHaveCount(2); // left-to-right and right-to-left
		expect(errors).toEqual([]);
	});

	test('shows the server-down page when the API is unreachable', async ({ page }) => {
		await page.route(`${SERVICES}/**`, (route) => route.abort('connectionrefused'));

		await page.goto('/');

		await expect(page).toHaveURL(/\/info\/server-down$/);
		await expect(page.getByText('Server connection is lost')).toBeVisible();
	});

	test('the login button needs a username and a password', async ({ page }) => {
		await page.route(`${SERVICES}/`, (route) => route.fulfill({ status: 404, body: 'Cannot GET /' }));
		await page.goto('/login');

		await page.locator('#username').fill('');
		await expect(page.locator('button.login-button')).toBeDisabled();

		await page.locator('#username').fill('carrier');
		await page.locator('#password').fill('pw');
		await expect(page.locator('button.login-button')).toBeDisabled(); // min length 4
		await page.locator('#password').fill('secret');
		await expect(page.locator('button.login-button')).toBeEnabled();
	});
});
