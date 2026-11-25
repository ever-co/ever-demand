import { expect, test, type Page } from '@playwright/test';
import {
	API_REQUIRED,
	apiIsUp,
	collectPageErrors,
	openShop,
	removeSeed,
	seedStoreWithProduct,
	type SeededProduct,
} from './support';

/**
 * Sign-up by address (the "invite by location" flow), buying as an anonymous visitor
 * (sign-up first, then the order goes through) and the orders page.
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

	/** Fills the address form of /login/byLocation (Bulgaria, Sofia, Vitosha 1, no apartment). */
	async function fillAddress(page: Page) {
		await expect(
			page.getByRole('heading', { name: 'What is your address?' })
		).toBeVisible();

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

	async function inviteSystemEnabled(page: Page) {
		return (await page.evaluate(() => localStorage.getItem('_inviteSystem'))) === 'enabled';
	}

	test('signs up by address', async ({ page }) => {
		const errors = collectPageErrors(page);
		await openShop(page, '/login/byLocation');
		await expect(page).toHaveURL(/\/login\/byLocation$/);

		await fillAddress(page);

		if (await inviteSystemEnabled(page)) {
			// With invites on, the address becomes an invite request; the shop says thanks
			await expect(page).toHaveURL(/\/login$/);
			await expect(page.getByText('Thanks for registering!')).toBeVisible();
			await expect(page.getByText('Vitosha 1, Sofia')).toBeVisible();
		} else {
			await expect(page).toHaveURL(/\/products$/);
			const userId = await page.evaluate(() => localStorage.getItem('_userId'));
			expect(userId).toMatch(/^[0-9a-f]{24}$/);
		}

		expect(errors).toEqual([]);
	});

	test('an anonymous buyer signs up, then the order is placed', async ({ page }) => {
		await openShop(page, '/products');
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
		const order = page.locator('order', { hasText: seed.title });
		await expect(order).toBeVisible();
		await expect(order).toContainText(`$${seed.price}`);
		await expect(order.getByRole('button', { name: 'Cancel' })).toBeVisible();
	});

	test('a signed-up customer orders from the product details and sees the order', async ({
		page,
	}) => {
		await openShop(page, '/login/byLocation');
		test.skip(await inviteSystemEnabled(page), 'the API has invites enabled');
		await fillAddress(page);
		await expect(page).toHaveURL(/\/products$/);

		await page.goto(`/products/details/${seed.warehouseId}/${seed.productId}`);
		await page
			.locator('product-details')
			.getByRole('button', { name: /Buy for/ })
			.click();

		await expect(page).toHaveURL(/\/orders$/, { timeout: 30_000 });
		const order = page.locator('order', { hasText: seed.title });
		await expect(order).toBeVisible();
		await expect(order).toContainText('order ID:');
		await expect(order).toContainText('Delivery');

		// The toolbar leads back to the products
		await page.getByRole('button', { name: 'Products' }).click();
		await expect(page).toHaveURL(/\/products$/);
	});

	test('a new customer has no orders', async ({ page }) => {
		await openShop(page, '/login/byLocation');
		test.skip(await inviteSystemEnabled(page), 'the API has invites enabled');
		await fillAddress(page);
		await expect(page).toHaveURL(/\/products$/);

		await page.getByRole('button', { name: 'Orders' }).click();

		await expect(page).toHaveURL(/\/orders$/);
		await expect(page.getByText('There are no orders ...')).toBeVisible();
	});
});
