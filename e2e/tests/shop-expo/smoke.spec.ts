/**
 * Expo shop app, no data needed: the web build boots, shows the first page and logs no errors
 * other than "API unreachable" ones. Runs with or without the API.
 */
import { expect, test } from '@playwright/test';
import { SOFIA, freshSession, isApiUp, watchConsole } from './helpers';

test.use({ geolocation: SOFIA, permissions: ['geolocation'] });

test('app shell boots without console errors', async ({ page }) => {
	const console = watchConsole(page);
	await freshSession(page);
	await page.goto('/');

	const apiUp = await isApiUp();
	if (apiUp) {
		// First run: an invite page, or the feed when the server lets visitors browse first.
		await expect(
			page
				.getByTestId('invite-by-code-screen')
				.or(page.getByTestId('invite-by-location-screen'))
				.or(page.getByTestId('products-screen')),
		).toBeVisible();
	} else {
		// No API: the server-down page, which keeps checking every 5 s.
		await expect(page.getByTestId('server-down-screen')).toBeVisible();
		await expect(page.getByText('Server connection is lost')).toBeVisible();
	}

	await expect(page).toHaveTitle(/Ever/);
	expect(console.unexpected()).toEqual([]);
});

test('deep links resolve to the Ionic paths', async ({ page }) => {
	await freshSession(page);
	await page.goto('/language');
	await expect(page.getByText('Select Language')).toBeVisible();
	await expect(page.getByTestId('language-en-US')).toBeVisible();
	await expect(page.getByTestId('language-he-IL')).toBeVisible();
});

test('the language page switches to Hebrew (right to left)', async ({ page }) => {
	await freshSession(page);
	await page.goto('/language');
	await page.getByTestId('language-he-IL').click();
	await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
	await expect(page.locator('html')).toHaveAttribute('lang', 'he');
});

test('connection lost page', async ({ page }) => {
	await freshSession(page);
	await page.goto('/errors/connection-lost');
	await expect(page.getByText('No connection to Ever')).toBeVisible();
});
