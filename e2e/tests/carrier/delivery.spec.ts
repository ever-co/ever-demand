import { expect, Page, test } from '@playwright/test';
import {
	Carrier,
	createCarrier,
	createOrderReadyForCarrier,
	getOrder,
} from './fixtures';

/**
 * Carrier flows against a running API (GraphQL :8443, socket.io :5500): login, the work
 * toggle, the menu pages and a whole delivery, checked through the API after each step.
 */
test.describe.configure({ mode: 'serial' });

let carrier: Carrier;

test.beforeAll(async () => {
	carrier = await createCarrier();
});

async function login(page: Page, who: Carrier = carrier) {
	await page.goto('/login');
	await page.locator('#username').fill(who.username);
	await page.locator('#password').fill(who.password);
	await page.locator('button.login-button').click();
	await expect(page).toHaveURL(/\/main\/home$/);
}

async function openMenu(page: Page) {
	await page.locator('page-main ion-menu-toggle, ion-header ion-menu-toggle').first().click();
	await expect(page.locator('ion-menu[menu-id="ltr"], ion-menu').first()).toBeVisible();
}

test('a wrong password keeps the carrier on the login page', async ({ page }) => {
	page.on('dialog', (dialog) => dialog.accept());
	await page.goto('/login');
	await page.locator('#username').fill(carrier.username);
	await page.locator('#password').fill('wrong-password');
	await page.locator('button.login-button').click();

	await expect(page).toHaveURL(/\/login$/);
});

test('login opens the home page with the work toggle', async ({ page }) => {
	await login(page);

	await expect(page.getByText('Deliveries:')).toBeVisible();
	await expect(page.getByText('Not Working')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Start Working' })).toBeVisible();
	expect(await page.evaluate(() => localStorage.getItem('carrier'))).toBe(carrier.id);
});

test('start and stop working change the carrier status', async ({ page }) => {
	await login(page);

	await page.getByRole('button', { name: 'Start Working' }).click();
	await expect(page.getByText('Working', { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Stop Working' })).toBeVisible();

	await page.getByRole('button', { name: 'Stop Working' }).click();
	await expect(page.getByText('Not Working')).toBeVisible();
});

test('the menu opens the deliveries history, language and about pages', async ({ page }) => {
	await login(page);

	await openMenu(page);
	await page.locator('ion-menu').first().getByText('Deliveries').click();
	await expect(page).toHaveURL(/\/deliveries$/);
	await expect(page.getByText('Deliveries History')).toBeVisible();

	await page.goto('/language');
	await expect(page.locator('#languageTitle')).toHaveText(/Select language/);
	await page.locator('ion-radio[value="bg-BG"]').click();
	await expect.poll(() => page.evaluate(() => localStorage.getItem('_language'))).toBe('bg-BG');
	await page.locator('ion-radio[value="en-US"]').click();
	await expect(page.locator('#languageTitle')).toHaveText(/Select language/);

	await page.goto('/information/about');
	await expect(page.locator('#aboutTitle')).toHaveText(/About Us/);
	await expect(page.getByText(/App Version/)).toBeVisible();
});

test('a whole delivery: take the order, pick it up, deliver it', async ({ page }) => {
	test.setTimeout(180_000);
	await createOrderReadyForCarrier();
	page.on('dialog', (dialog) => dialog.accept());

	await login(page);
	await page.getByRole('button', { name: 'Start Working' }).click();

	// the app polls for the nearest packaged order and opens it
	await expect(page).toHaveURL(/\/main\/drive-to-warehouse$/, { timeout: 60_000 });
	const orderId = await page.evaluate(() => localStorage.getItem('orderId'));
	expect(orderId).toBeTruthy();
	await expect(page.getByText(/Order ID:/)).toBeVisible();

	await page.getByRole('button', { name: 'Take work' }).click();
	await expect.poll(async () => (await getOrder(orderId)).carrierStatus, { timeout: 20_000 }).toBe(1);

	await page.getByRole('button', { name: "I'm there" }).click();
	await expect(page).toHaveURL(/\/product\/get$/);
	await page.getByRole('button', { name: 'Got It' }).click();
	await expect(page).toHaveURL(/\/main\/starting-delivery$/);
	await expect.poll(async () => (await getOrder(orderId)).carrierStatus, { timeout: 20_000 }).toBe(2);

	await page.getByRole('button', { name: 'Start' }).click();
	await expect(page).toHaveURL(/\/main\/delivery$/);
	await expect.poll(async () => (await getOrder(orderId)).carrierStatus, { timeout: 20_000 }).toBe(3);
	await expect(page.getByText(/The Customer has to pay|Customer already paid/)).toBeVisible();

	await page.getByRole('button', { name: 'Delivered' }).click();
	await expect.poll(async () => (await getOrder(orderId)).carrierStatus, { timeout: 20_000 }).toBe(5);
	// still online: home, or straight on to the next packaged order nearby
	await expect(page).toHaveURL(/\/main\/(home|drive-to-warehouse)$/);
	await expect.poll(() => page.evaluate(() => localStorage.getItem('orderId'))).not.toBe(orderId);

	// the completed order shows up in the deliveries history
	await page.goto('/deliveries');
	await expect(page.locator('order-card').first()).toBeVisible({ timeout: 20_000 });
});
