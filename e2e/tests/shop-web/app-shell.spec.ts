import { expect, test } from '@playwright/test';
import { apiIsUp, collectPageErrors, openShop } from './support';

/**
 * Runs with or without the API: the shop boots, and shows either its pages (API up) or the
 * "server connection is lost" page (API down) instead of a blank screen.
 */
test.describe('shop web: app shell', () => {
	test('boots without uncaught errors', async ({ page }) => {
		const errors = collectPageErrors(page);

		await openShop(page);

		await expect(page).toHaveTitle('Ever');
		// The loading logo of index.html is replaced by the app
		await expect(page.locator('app .app-loading')).toHaveCount(0);

		if (await apiIsUp()) {
			await expect(page).toHaveURL(/\/(products|login)/);
		} else {
			await expect(page).toHaveURL(/\/server-down$/);
			await expect(page.getByText('Server connection is lost')).toBeVisible();
		}

		expect(errors).toEqual([]);
	});

	test('serves the translation catalogues and the icons', async ({ request }) => {
		for (const lang of ['en-US', 'es-ES', 'bg-BG', 'he-IL', 'ru-RU', 'fr-FR']) {
			const res = await request.get(`/assets/i18n/${lang}.json`);
			expect(res.ok(), lang).toBe(true);
			expect(await res.json()).toHaveProperty('PRODUCTS_VIEW');
		}

		for (const icon of ['basket', 'history', 'settings']) {
			const res = await request.get(`/assets/icon/${icon}.svg`);
			expect(res.ok(), icon).toBe(true);
		}
	});

	test('falls back to the app for deep links', async ({ page }) => {
		const errors = collectPageErrors(page);

		await openShop(page, '/settings');

		await expect(page.locator('app')).not.toBeEmpty();
		expect(errors).toEqual([]);
	});
});
