import { expect, Page, test } from '@playwright/test';
import {
	addProductToStore,
	createCarrier,
	createCustomer,
	createOrder,
	createProduct,
	createStore,
	getOrder,
	Store,
} from '../carrier/fixtures';

/**
 * Merchant flows against a running API (GraphQL :8443, socket.io :5500): login, the order
 * workflow buttons, products, carriers, customers and settings of a fresh store.
 */
test.describe.configure({ mode: 'serial' });

let store: Store;
let product: { id: string; title: string };

test.beforeAll(async () => {
	store = await createStore();
	product = await createProduct();
	await addProductToStore(store.id, product.id);
});

async function login(page: Page, who: Store = store) {
	await page.goto('/login');
	await page.getByPlaceholder('Username').fill(who.username);
	await page.getByPlaceholder('Password').fill(who.password);
	await page.locator('button.login-button').click();
	await expect(page).toHaveURL(/\/warehouse$/);
}

test('a wrong password keeps the merchant on the login page', async ({ page }) => {
	page.on('dialog', (dialog) => dialog.accept());
	await page.goto('/login');
	await page.getByPlaceholder('Username').fill(store.username);
	await page.getByPlaceholder('Password').fill('wrong-password');
	await page.locator('button.login-button').click();

	await expect(page).toHaveURL(/\/login$/);
});

test('login opens the warehouse with orders and products', async ({ page }) => {
	await login(page);

	await expect(page.locator('.orders-container .title')).toHaveText(/Orders/);
	await expect(page.getByText('Top Products')).toBeVisible();
	expect(await page.evaluate(() => localStorage.getItem('_warehouseId'))).toBe(store.id);
});

test('the store products are listed in "All" products', async ({ page }) => {
	await login(page);

	await page.locator('.products-container button.all').click();
	await expect(page.getByText(product.title.slice(0, 12)).first()).toBeVisible({ timeout: 30_000 });
});

test('an order moves through the warehouse statuses', async ({ page }) => {
	test.setTimeout(120_000);
	const customer = await createCustomer();
	const order = await createOrder(store.id, customer.id, product.id);

	await login(page);

	const card = page.locator('.order-control-buttons').first();
	await expect(card).toBeVisible({ timeout: 30_000 });

	const before = (await getOrder(order.id)).warehouseStatus;
	const firstStep = card.locator('a.button').first();
	await firstStep.click();
	await expect
		.poll(async () => (await getOrder(order.id)).warehouseStatus, { timeout: 20_000 })
		.toBeGreaterThan(before);
});

test('carriers, customers and settings pages open', async ({ page }) => {
	await login(page);

	await page.goto('/carriers');
	await expect(page.locator('.page-carriers .title')).toHaveText(/Carriers/);

	await page.goto('/customers');
	await expect(page.locator('.customers-page .title')).toHaveText(/Customers/);

	await page.goto('/settings');
	await expect(page.locator('.page-settings .title')).toHaveText(/Settings/);
	await expect(page.locator('ion-segment-button')).toHaveCount(4);
});

test('the store carriers are listed in the carriers table', async ({ page }) => {
	// one carrier assigned by an admin (carriersIds), one added by the store (usedCarriersIds)
	const own = await createCarrier();
	const added = await createCarrier();
	const withCarriers = await createStore({
		hasRestrictedCarriers: true,
		carriersIds: [own.id],
		usedCarriersIds: [added.id],
	});

	await login(page, withCarriers);
	await page.goto('/carriers');

	const table = page.locator('angular2-smart-table');
	await expect(table).toBeVisible({ timeout: 30_000 });
	await expect(table.locator('tbody tr')).toHaveCount(2);
	// custom cells (phone, status, ...) get their data through componentInitFunction
	await expect(table.locator('carrier-phone').first()).toContainText('+359888222222');
});
