import { expect, test, type Page } from '@playwright/test';
import {
	API_REQUIRED,
	apiIsUp,
	collectPageErrors,
	openShop,
	registerCustomer,
	removeSeed,
	seedStoreWithProduct,
	type SeededProduct,
} from './support';

/**
 * Sign-up by address ("invite by location"), ordering and the orders page.
 *
 * With the API defaults (no invites, no registration required on start) a visitor browses
 * the products anonymously; "buy" asks for the address first (registration "once"), signs
 * the visitor up and then places the order.
 */
test.describe('shop web: sign-up, order and orders', () => {
	test.use({ locale: 'en-US' });

	let seed: SeededProduct | undefined;

	test.beforeAll(async () => {
		test.skip(!(await apiIsUp()), API_REQUIRED);
		seed = await seedStoreWithProduct();
	});

	test.afterAll(async () => {
		await removeSeed(seed);
	});

	async function inviteSystemEnabled(page: Page) {
		return (await page.evaluate(() => localStorage.getItem('_inviteSystem'))) === 'enabled';
	}

	/** Fills the address form of /login/byLocation (Bulgaria, Sofia, Vitosha 1, no apartment). */
	async function fillAddress(page: Page) {
		await expect(page.getByRole('heading', { name: 'What is your address?' })).toBeVisible();

		await page.locator('mat-select[formcontrolname="countryId"]').click();
		await page.getByRole('option', { name: 'Bulgaria' }).click();
		await page.getByPlaceholder('Selected City').fill('Sofia');
		await page.getByPlaceholder('Selected Street').fill('Vitosha');
		await page.getByPlaceholder('house').fill('1');
		// "Apartment" is ticked by default: untick it, or the form wants an apartment number
		await page.locator('mat-checkbox[formcontrolname="isApartment"] input').uncheck();

		const next = page.getByRole('button', { name: 'Continue' });
		await expect(next).toBeVisible();
		await next.click();
	}

	/** Anonymous visitor: search the seeded product and buy it (the shop asks for the address). */
	async function buyAsNewVisitor(page: Page) {
		await openShop(page, '/products');
		await expect(page).toHaveURL(/\/products$/);
		test.skip(await inviteSystemEnabled(page), 'the API has invites enabled');

		await page.getByPlaceholder('e.g Pepperoni Pizza Sushi...').fill(seed.title);
		const card = page.locator('product', { hasText: seed.title });
		await card.getByRole('button', { name: /Buy for/ }).click();

		// No user yet: the shop keeps the product and asks for the address first
		await expect(page).toHaveURL(/\/login\/byLocation$/);
		expect(await page.evaluate(() => localStorage.getItem('_buyProduct'))).toBe(
			seed.warehouseProductId
		);
		await fillAddress(page);

		await expect(page).toHaveURL(/\/orders$/, { timeout: 30_000 });
	}

	test('an anonymous buyer signs up by address, then the order is placed', async ({ page }) => {
		const errors = collectPageErrors(page);

		await buyAsNewVisitor(page);

		const userId = await page.evaluate(() => localStorage.getItem('_userId'));
		expect(userId).toMatch(/^[0-9a-f]{24}$/);
		const order = page.locator('order', { hasText: seed.title });
		await expect(order).toBeVisible();
		await expect(order).toContainText(`$${seed.price}`);
		await expect(order).toContainText('order ID:');
		await expect(order).toContainText('Delivery');
		await expect(order.getByRole('button', { name: 'Cancel' })).toBeVisible();
		expect(errors).toEqual([]);
	});

	test('a signed-up customer orders again from the product details', async ({ page }) => {
		await buyAsNewVisitor(page);
		await expect(page.locator('order', { hasText: seed.title })).toHaveCount(1);

		await page.goto(`/products/details/${seed.warehouseId}/${seed.productId}`);
		await page.locator('product-details').getByRole('button', { name: /Buy for/ }).click();

		await expect(page).toHaveURL(/\/orders$/, { timeout: 30_000 });
		await expect(page.locator('order', { hasText: seed.title })).toHaveCount(2);

		// The toolbar leads back to the products
		await page.getByRole('button', { name: 'Products' }).click();
		await expect(page).toHaveURL(/\/products$/);
	});

	test('a new customer has no orders', async ({ page }) => {
		const userId = await registerCustomer();
		await page.addInitScript((id) => localStorage.setItem('_userId', id), userId);

		await openShop(page, '/orders');

		await expect(page).toHaveURL(/\/orders$/);
		await expect(page.getByText('There are no orders ...')).toBeVisible();
	});

	test('the address form is not shown again to a signed-up customer', async ({ page }) => {
		const userId = await registerCustomer();
		await page.addInitScript((id) => localStorage.setItem('_userId', id), userId);

		await openShop(page, '/login/byLocation');

		await expect(page).toHaveURL(/\/products$/);
	});
});
