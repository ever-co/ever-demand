import { expect, test } from '@playwright/test';
import { apiIsUp, expectAppShell, seedStorage, watchConsole } from './support';
import { SERVICES_URL } from '../helpers';

// UI checks that need no data: when no API runs, the API root answers 404 here, like a
// running API does, so the app does not stop at the server-down page. Everything that
// needs data waits on sockets that never connect, which these tests do not touch.
test.describe('shop-mobile pages without data', () => {
	test.beforeEach(async ({ page }) => {
		if (!(await apiIsUp())) {
			await page.route(`${SERVICES_URL}/`, (route) =>
				route.fulfill({ status: 404, body: 'Cannot GET /' }),
			);
		}
		// "Browse first" mode, as when the server does not require registration.
		await seedStorage(page, { _registrationSystem: 'disabled' });
	});

	/** Opens a page from the side menu, as a customer does (keeps the in-app history). */
	const openFromMenu = async (page, item: string) => {
		await page.locator('ion-menu-button').first().click();
		const menu = page.locator('ion-menu.show-menu');
		await menu.getByText(item, { exact: true }).click();
	};

	test('the language page switches the app to Hebrew, right to left', async ({
		page,
	}) => {
		const unexpectedErrors = watchConsole(page);

		await page.goto('/products');
		await expectAppShell(page);
		await openFromMenu(page, 'Language');
		await expect(page).toHaveURL(/\/language$/);
		await expect(page.getByText('Select Language')).toBeVisible();

		await page.locator('ion-radio[value="he-IL"]').click();

		// The page goes back to where the customer came from.
		await expect(page).toHaveURL(/\/products$/);
		await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
		await expect(page.locator('html')).toHaveAttribute('lang', 'he');
		expect(
			await page.evaluate(() => localStorage.getItem('_language')),
		).toBe('he-IL');

		// The menu is on the right in Hebrew.
		await page.locator('ion-menu-button').first().click();
		await expect(page.locator('ion-menu.show-menu')).toHaveAttribute(
			'side',
			'end',
		);
		await expect(
			page.locator('ion-menu.show-menu').getByText('שפה'),
		).toBeVisible();

		expect(unexpectedErrors()).toEqual([]);
	});

	test('the side menu lists the app pages', async ({ page }) => {
		await page.goto('/products');
		await expectAppShell(page);

		await page.locator('ion-menu-button').first().click();
		const menu = page.locator('ion-menu.show-menu');
		await expect(menu).toHaveAttribute('side', 'start');
		for (const item of [
			'Products',
			'Order history',
			'Language',
			'Help',
			'About Us',
			'Privacy',
			'Terms of Use',
		]) {
			await expect(menu.getByText(item, { exact: true })).toBeVisible();
		}
		// SUPPORT_NUMBER is set by default, so "Call Us" shows.
		await expect(menu.getByText('Call Us')).toBeVisible();
	});

	test('shows the connection lost page when the device goes offline and goes back after', async ({
		page,
		context,
	}) => {
		await page.goto('/products');
		await expectAppShell(page);
		await openFromMenu(page, 'Language');
		await expect(page.getByText('Select Language')).toBeVisible();

		await context.setOffline(true);
		await expect(page).toHaveURL(/\/errors\/connection-lost$/);
		await expect(page.getByText('No connection to Ever')).toBeVisible();

		await context.setOffline(false);
		await expect(page).toHaveURL(/\/language$/);
	});
});
