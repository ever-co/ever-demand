import { expect, test } from '@playwright/test';
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
 * Products list and product details, for an anonymous visitor (the API default: no
 * invites, no registration required on start, so "/" opens the products).
 */
test.describe('shop web: products', () => {
	test.use({ locale: 'en-US' });

	let seed: SeededProduct | undefined;

	test.beforeAll(async () => {
		test.skip(!(await apiIsUp()), API_REQUIRED);
		seed = await seedStoreWithProduct();
	});

	test.afterAll(async () => {
		await removeSeed(seed);
	});

	async function searchSeededProduct(page) {
		await openShop(page, '/products');
		await expect(page).toHaveURL(/\/products$/);

		await page.getByPlaceholder('e.g Pepperoni Pizza Sushi...').fill(seed.title);

		const card = page.locator('product', { hasText: seed.title });
		await expect(card).toBeVisible();
		return card;
	}

	test('lists the products around the visitor and finds one by its name', async ({
		page,
	}) => {
		const errors = collectPageErrors(page);
		const card = await searchSeededProduct(page);

		await expect(page.locator('product')).toHaveCount(1);
		await expect(card.locator('.title')).toHaveText(seed.title);
		await expect(card.getByRole('button', { name: /Buy for/ })).toContainText(
			`$${seed.price}`
		);
		await expect(card.locator('product-delivery-info')).toContainText('20-40');
		// 10 instead of 12: the discount circle shows the initial price
		await expect(card.locator('.discount-circle')).toContainText('$12');

		expect(errors).toEqual([]);
	});

	test('says when nothing matches the search', async ({ page }) => {
		await openShop(page, '/products');

		await page
			.getByPlaceholder('e.g Pepperoni Pizza Sushi...')
			.fill(`no such product ${Date.now()}`);

		await expect(page.getByText(/No products found/i)).toBeVisible();
	});

	test('opens the details of a product', async ({ page }) => {
		const card = await searchSeededProduct(page);

		await card.getByRole('button', { name: 'Details' }).click();

		await expect(page).toHaveURL(
			new RegExp(`/products/details/${seed.warehouseId}/${seed.productId}$`)
		);
		const details = page.locator('product-details');
		await expect(details.locator('h1.title')).toHaveText(seed.title);
		await expect(details.locator('.warehouse-name')).toHaveText(seed.warehouseName);
		await expect(details.locator('.details')).toHaveText('Tomato, cheese');
		await expect(details.getByRole('button', { name: /Buy for/ })).toContainText(
			`${seed.price}$`
		);
		await expect(details.locator('.delivery-address')).toContainText('Vitosha');

		await details.getByRole('button', { name: 'Back' }).click();
		await expect(page).toHaveURL(/\/products$/);
	});

	test('switches between delivery and takeaway', async ({ page }) => {
		await openShop(page, '/products');
		const toggle = page.locator('mat-slide-toggle').getByRole('switch');

		await expect(toggle).toBeChecked();
		await toggle.click();
		await expect(toggle).not.toBeChecked();
		expect(await page.evaluate(() => localStorage.getItem('deliveryType'))).toBe('1');
	});
});
