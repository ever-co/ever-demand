/**
 * Expo shop app main flows against a running API (default ports, see e2e/playwright.config.ts).
 * Skipped when the API is not reachable.
 */
import { expect, test } from '@playwright/test';
import { SOFIA, completeInvite, freshSession, isApiUp, openShop, registeredCustomer, watchConsole } from './helpers';

test.use({ geolocation: SOFIA, permissions: ['geolocation'] });

test.beforeAll(async () => {
	test.skip(!(await isApiUp()), 'needs the API at SERVICES_ENDPOINT (http://localhost:5500)');
});

test('a first-time visitor reaches the product feed', async ({ page }) => {
	const console = watchConsole(page);
	await openShop(page);
	await expect(page.getByTestId('products-screen')).toBeVisible();
	await expect(
		page.getByTestId('products-slides').or(page.getByTestId('products-list')),
	).toBeVisible();
	expect(console.unexpected()).toEqual([]);
});

test('buys a product (registering when asked), tracks the order and cancels it', async ({ page }) => {
	await openShop(page);
	const buy = page.getByTestId('buy-button').first();
	test.skip(!(await buy.waitFor({ timeout: 15000 }).then(() => true, () => false)), 'no products near Sofia in this database');

	await buy.click();
	const invite = page.getByTestId('invite-by-code-screen').or(page.getByTestId('invite-by-location-screen'));
	const orderPage = page.getByTestId('order-info-screen').or(page.getByTestId('order-takeaway-info-screen'));
	await invite.or(orderPage).first().waitFor();
	if (await invite.first().isVisible()) {
		// "Browse first": the invite, then the remembered Buy resumes.
		await completeInvite(page);
	}
	await expect(page.getByTestId('order-info-screen').or(page.getByTestId('order-takeaway-info-screen'))).toBeVisible();
	await expect(page.getByTestId('order-status-title')).not.toBeEmpty();
	await expect(page.getByTestId('elapsed-time')).toBeVisible();

	await page.getByTestId('undo-button').click();
	await expect(page.getByText('Are you sure?')).toBeVisible();
	await page.getByTestId('cancel-yes-button').click();
	await expect(page.getByTestId('products-screen')).toBeVisible();
	await expect(page.getByTestId('order-sign')).toHaveCount(0);
});

test('product details from the feed', async ({ page }) => {
	await registeredCustomer(page);
	const details = page.getByTestId('details-button').first();
	test.skip(!(await details.waitFor({ timeout: 15000 }).then(() => true, () => false)), 'no products near Sofia in this database');
	await details.click();
	await expect(page.getByTestId('product-details-screen')).toBeVisible();
	await expect(page.getByTestId('product-details-title')).not.toBeEmpty();
	await page.getByTestId('back-button').click();
	await expect(page.getByTestId('products-screen')).toBeVisible();
});

test('search panel lists merchants and products', async ({ page }) => {
	await registeredCustomer(page);
	await page.getByTestId('search-toggle').click();
	await expect(page.getByTestId('search-panel')).toBeVisible();
	await expect(page.getByTestId('search-loading')).toHaveCount(0, { timeout: 15000 });
});

test('side menu: orders history, info pages and language', async ({ page }) => {
	await registeredCustomer(page);

	await page.getByTestId('menu-button').click();
	await page.getByTestId('menu-OrdersHistory').click();
	await expect(page.getByTestId('orders-history-screen')).toBeVisible();
	// The dev invite seeds 40 orders; an empty database shows the empty state.
	await expect(page.getByTestId('orders-list').or(page.getByTestId('orders-empty'))).toBeVisible({ timeout: 20000 });

	await page.getByTestId('menu-button').click();
	await page.getByTestId('menu-About').click();
	await expect(page.getByTestId('info-screen-About')).toBeVisible();
	await expect(page.getByTestId('info-html')).not.toContainText('Loading...', { timeout: 15000 });

	await page.getByTestId('menu-button').click();
	await page.getByTestId('menu-Language').click();
	await page.getByTestId('language-bg-BG').click();
	await page.getByTestId('menu-button').click();
	await expect(page.getByTestId('side-menu')).toContainText('Език');
});

test('merchants page: close merchants and entering a store', async ({ page }) => {
	await registeredCustomer(page);
	await page.goto('/merchants');
	await expect(page.getByTestId('merchants-screen')).toBeVisible();
	await expect(page.getByTestId('merchants-header')).toHaveText('Merchants close to you');
	const first = page.locator('[data-testid^="merchant-"]').filter({ hasNot: page.getByTestId('merchants-header') }).first();
	if (await first.waitFor({ timeout: 10000 }).then(() => true, () => false)) {
		await first.click();
		await expect(page.getByTestId('products-screen')).toBeVisible();
		await expect(page.getByText('Exit Store')).toBeVisible();
	}
});

test('a stored user the server does not know is forgotten', async ({ page }) => {
	await freshSession(page);
	await page.evaluate(() =>
		window.localStorage.setItem(
			'ever-shop-session',
			JSON.stringify({ userId: '000000000000000000000000', language: 'en-US' }),
		),
	);
	await page.goto('/');
	// The invite again, or the feed in "browse first" mode, but no longer as that user.
	await expect(
		page.getByTestId('invite-by-code-screen').or(page.getByTestId('invite-by-location-screen')).or(page.getByTestId('products-screen')),
	).toBeVisible();
	await expect
		.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem('ever-shop-session') || '{}').userId ?? null))
		.toBeNull();
});
