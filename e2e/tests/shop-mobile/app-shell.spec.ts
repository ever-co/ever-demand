import { expect, test } from '@playwright/test';
import { apiIsUp, expectAppShell, watchConsole } from './support';

// Runs without an API: it only needs the dev server (`pnpm --filter @ever-platform/shop-mobile-ionic start`).
test.describe('shop-mobile app shell', () => {
	test('boots, renders the Ionic shell and loads the translations', async ({
		page,
	}) => {
		const unexpectedErrors = watchConsole(page);
		// "[Ionic Warning]" (e.g. a deprecated IonicModule) and "[Ionicons Warning]"
		// (an icon name that is not registered with addIcons).
		const ionicWarnings: string[] = [];
		page.on('console', (msg) => {
			if (/\[Ionic(ons)? Warning\]/.test(msg.text()))
				ionicWarnings.push(msg.text());
		});

		await page.goto('/');
		await expectAppShell(page);

		// The side menu is in the DOM on every page, with its translated title.
		await expect(page.locator('ion-menu').first()).toBeAttached();
		await expect(page.locator('ion-menu ion-title').first()).toHaveText(
			'Ever',
			{ timeout: 30_000 },
		);
		// Its icons render (registered with addIcons, drawn in the shadow root).
		await expect(
			page.locator('ion-menu ion-icon[name="basket"] svg').first(),
		).toBeAttached({ timeout: 30_000 });

		// One of the start pages is shown: invite, products, server down or maintenance.
		await expect(page).toHaveURL(
			/\/(invite|products|server-down|maintenance-info)/,
			{ timeout: 30_000 },
		);

		expect(unexpectedErrors()).toEqual([]);
		expect(ionicWarnings).toEqual([]);
	});

	test('shows the server-down page while the API is unreachable', async ({
		page,
	}) => {
		test.skip(await apiIsUp(), 'the API is up');

		const unexpectedErrors = watchConsole(page);

		await page.goto('/');
		await expect(page).toHaveURL(/\/server-down$/, { timeout: 30_000 });
		await expect(page.getByText('Server connection is lost')).toBeVisible();

		expect(unexpectedErrors()).toEqual([]);
	});

	test('serves the PWA manifest and the translations', async ({
		request,
	}) => {
		const manifest = await request.get('/manifest.json');
		expect(manifest.ok()).toBeTruthy();

		for (const lang of [
			'en-US',
			'bg-BG',
			'he-IL',
			'ru-RU',
			'es-ES',
			'fr-FR',
		]) {
			const res = await request.get(`/assets/i18n/${lang}.json`);
			expect(res.ok(), lang).toBeTruthy();
			const json = await res.json();
			expect(json.BUY_POPUP.PAYMENT_FAILED, lang).toBeTruthy();
			expect(json.BUY_POPUP.EMAIL_NOT_SAVED, lang).toBeTruthy();
		}
		// No /svg icon folder any more: the icons are bundled (src/app/icons.ts).
	});
});
