import { expect, test, type Page } from '@playwright/test';
import {
	apiIsUp,
	expectAppShell,
	productsNearSofia,
	pyro,
	registerCustomer,
	seedStorage,
	watchConsole,
} from './support';
import { gql } from '../helpers';

/**
 * Main customer flows against a running API (docs/latest-stack/shop-mobile-features.md).
 * Each test starts from a fresh browser profile. The API defaults are used: delivery,
 * slides view, page mode for the order info, location = Sofia (the env default).
 *
 * The API runs without a Stripe key, so no test pays: card payments are covered by the
 * unit specs (payment.component*.spec.ts).
 */
test.describe('shop-mobile flows (needs the API)', () => {
	let registrationRequired = false;
	let invitesOn = false;

	test.beforeAll(async () => {
		test.skip(!(await apiIsUp()), 'the API is not running');
		registrationRequired = (
			await pyro('user-auth', 'getRegistrationsSettings')
		).registrationRequiredOnStart;
		invitesOn = (await pyro('invite', 'getInvitesSettings')).isEnabled;
	});

	/** Seeds a registered customer at the default location. */
	const asCustomer = async (page: Page) => {
		const user = await registerCustomer();
		const userId = user._id ?? user.id;
		expect(userId).toBeTruthy();
		await seedStorage(page, { _userId: String(userId) });
		return String(userId);
	};

	const buyButtons = (page: Page) =>
		page.getByRole('button', { name: /Buy for/ });

	test('a new customer starts on the invite pages, then follows the server settings', async ({
		page,
	}) => {
		const unexpectedErrors = watchConsole(page);

		// (quirk) On the very first start the server settings are not loaded yet
		// (the start-up checks run side by side), so the invite page shows.
		await page.goto('/');
		await expectAppShell(page);
		await expect(page).toHaveURL(/\/invite\/by-(code|location)$/);

		// From the next start on, the server settings decide.
		await page.goto('/');
		if (registrationRequired) {
			await expect(page).toHaveURL(
				invitesOn ? /\/invite\/by-code$/ : /\/invite\/by-location$/,
			);
		} else {
			// "Browse first": no registration until the first Buy.
			await expect(page).toHaveURL(/\/products/);
		}

		expect(unexpectedErrors()).toEqual([]);
	});

	test('the product feed shows products with Buy and Details', async ({
		page,
	}) => {
		test.skip(
			(await productsNearSofia()).length === 0,
			'no products near the default location',
		);
		await asCustomer(page);

		await page.goto('/products');
		await expect(buyButtons(page).first()).toBeVisible({ timeout: 30_000 });
		await expect(
			page.getByRole('button', { name: 'Details' }).first(),
		).toBeVisible();
		// Header: Takeout / Delivery toggle and the search icon.
		await expect(page.getByText('Takeout').first()).toBeVisible();
		await expect(page.locator('ion-toggle')).toBeVisible();
	});

	test('Details opens the product page and Back returns to the feed', async ({
		page,
	}) => {
		test.skip(
			(await productsNearSofia()).length === 0,
			'no products near the default location',
		);
		await asCustomer(page);

		await page.goto('/products');
		await page.getByRole('button', { name: 'Details' }).first().click();

		await expect(page).toHaveURL(
			/\/products\/product-details\/[^/?]+\?backUrl=%2Fproducts&warehouseId=/,
		);
		await expect(page.getByText('Includes')).toBeVisible();
		await expect(buyButtons(page)).toBeVisible();

		await page.getByRole('button', { name: /Back/ }).click();
		await expect(page).toHaveURL(/\/products$/);
	});

	test('the search finds products and merchants', async ({ page }) => {
		await asCustomer(page);

		await page.goto('/products');
		await expectAppShell(page);
		await page.locator('ion-header ion-icon[name="search"]').click();

		const search = page.locator('search-products ion-searchbar input');
		await expect(search).toBeVisible();
		await search.fill('zzzz-no-such-product');
		await expect(
			page.getByText('No Products Or Merchants Found'),
		).toBeVisible({ timeout: 30_000 });
	});

	test('a registered customer without orders sees an empty order history', async ({
		page,
	}) => {
		await asCustomer(page);

		await page.goto('/orders-history');
		await expect(
			page.locator('ion-title', { hasText: 'Order history' }),
		).toBeVisible();
		await expect(page.getByText('No orders yet')).toBeVisible({
			timeout: 30_000,
		});

		await page.getByText('To Products').click();
		await expect(page).toHaveURL(/\/products/);
	});

	test('the info pages show the texts from the server', async ({ page }) => {
		await asCustomer(page);

		for (const [path, title] of [
			['/info/about', 'About Us'],
			['/info/help', 'Help'],
			['/info/privacy', 'Privacy'],
			['/info/terms-of-use', 'Terms of Use'],
		]) {
			await page.goto(path);
			await expect(
				page.locator('ion-title').getByText(title).first(),
			).toBeVisible();
			// The page shows "Loading..." until user.get<Page>() answers.
			await expect(page.getByText('Loading...')).toHaveCount(0, {
				timeout: 30_000,
			});
		}
	});

	test('the merchants page lists the merchants close to the customer', async ({
		page,
	}) => {
		await asCustomer(page);

		await page.goto('/merchants');
		await expect(page.getByText('Merchants close to you')).toBeVisible({
			timeout: 30_000,
		});
		await expect(page.locator('ion-searchbar')).toBeVisible();

		await page.getByRole('button', { name: /Back/ }).click();
		await expect(page).toHaveURL(/\/products/);
	});

	test('Buy creates a delivery order, Undo cancels it', async ({ page }) => {
		test.skip(
			(await productsNearSofia()).length === 0,
			'no products near the default location',
		);
		await asCustomer(page);

		await page.goto('/products');
		await buyButtons(page).first().click();

		// ORDER_INFO_TYPE=page: the delivery order opens on its own page.
		await expect(page).toHaveURL(/\/order-info$/, { timeout: 30_000 });
		await expect(page.getByText("We're preparing the order!")).toBeVisible({
			timeout: 30_000,
		});
		const orderId = await page.evaluate(() =>
			localStorage.getItem('_orderId'),
		);
		expect(orderId).toBeTruthy();

		await page.getByRole('button', { name: 'Undo' }).click();
		await expect(page.getByText('Are you sure?')).toBeVisible();
		await page.getByRole('button', { name: 'Yes' }).click();

		await expect(page).toHaveURL(/\/products/);
		await expect
			.poll(() => page.evaluate(() => localStorage.getItem('_orderId')))
			.toBeNull();

		const { data } = await gql(
			'query ($id: String!) { getOrder(id: $id) { id isCancelled } }',
			{ id: orderId },
		);
		expect(data?.getOrder?.isCancelled).toBe(true);
	});

	test('a new customer who taps Buy registers by address and gets the order', async ({
		page,
	}) => {
		test.skip(
			registrationRequired,
			'the server asks for registration before browsing',
		);
		test.skip(
			invitesOn,
			'with invites on, the address only requests an invite',
		);
		test.skip(
			(await productsNearSofia()).length === 0,
			'no products near the default location',
		);

		// The first start has no server settings yet (see the first test).
		await page.goto('/');
		await expect(page).toHaveURL(/\/invite\//);
		await page.goto('/products');
		await buyButtons(page).first().click();

		// Buy sets the registration to "once" and opens the address form.
		await expect(page).toHaveURL(/\/invite\/by-location$/);
		await expect(page.getByText('Let us know your Address')).toBeVisible();
		await expect(page.getByPlaceholder('City')).toBeVisible({
			timeout: 60_000,
		});

		await page.getByPlaceholder('City').fill('Sofia');
		await page.getByPlaceholder('Street').fill('Simeonovsko shose');
		await page.getByPlaceholder('House').fill('104');
		await page.getByPlaceholder('Apartment').fill('3');
		await page.getByRole('button', { name: 'Get inside!' }).click();

		// Registered, back on the products, and the product it tapped is bought.
		await expect
			.poll(() => page.evaluate(() => localStorage.getItem('_userId')), {
				timeout: 30_000,
			})
			.toBeTruthy();
		await expect(page).toHaveURL(/\/order-info$/, { timeout: 30_000 });
		await expect(
			page.getByText("We're preparing the order!"),
		).toBeVisible();
	});
});
