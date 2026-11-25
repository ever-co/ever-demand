import { expect, test } from '@playwright/test';
import { collectAppErrors, expectTable, login, requireApi, route } from './support';

// Every main screen of the admin opens, renders its content and logs no app errors.

test.describe('admin screens', () => {
	test.beforeEach(async ({ page }) => {
		await requireApi();
		await login(page);
	});

	test('dashboard shows the totals, the store picker and the charts', async ({ page }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('dashboard'));

		await expect(page.getByText('Total Customers')).toBeVisible({ timeout: 30_000 });
		await expect(page.getByText('Total Revenue')).toBeVisible();
		await expect(page.locator('ng-select').first()).toBeVisible();
		await expect(page.getByText(/^\s*orders\s*$/i).first()).toBeVisible();
		await expect(page.getByText(/^\s*profit\s*$/i).first()).toBeVisible();
		await expect(page.locator('[echarts], .echart').first()).toBeAttached();
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('the side menu reaches every section', async ({ page }) => {
		await page.goto(route('dashboard'));
		for (const [label, url] of [
			['Stores', /#\/stores/],
			['Carriers', /#\/carriers/],
			['Simulation', /#\/simulation/],
			['Setup', /#\/setup/],
			['Dashboard', /#\/dashboard/],
		] as const) {
			await page.locator('nb-menu').getByText(label, { exact: true }).click();
			await expect(page).toHaveURL(url);
		}
	});

	const tableScreens: Array<[string, string]> = [
		['stores', 'stores list'],
		['products/list', 'products list'],
		['products/categories', 'categories list'],
		['customers/list', 'customers list'],
		['customers/invites', 'invites list'],
		['carriers', 'carriers list'],
	];

	for (const [path, name] of tableScreens) {
		test(`${name} renders its table`, async ({ page }) => {
			const errors = collectAppErrors(page);
			await page.goto(route(path));
			await expectTable(page);
			// header row with at least one sortable/filterable column
			await expect(page.locator('ng2-smart-table th').first()).toBeVisible();
			expect(errors, errors.join('\n')).toEqual([]);
		});
	}

	test('orders screen opens', async ({ page }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('orders'));
		await expect(page).toHaveURL(/#\/orders/);
		// the orders overview is still a placeholder in the admin (as before the upgrade)
		await expect(page.getByText(/Orders Component/)).toBeVisible({ timeout: 30_000 });
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('setup (settings) screen offers data generation and merchant setup', async ({ page }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('setup'));
		await expect(page.getByRole('button', { name: /generate initial data/i })).toBeVisible({
			timeout: 30_000,
		});
		await expect(page.getByRole('button', { name: /setup merchants/i })).toBeVisible();
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('profile screen shows the admin account form', async ({ page }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('profile'));
		await expect(page.locator('input[formcontrolname="email"]').first()).toBeVisible({
			timeout: 30_000,
		});
		await expect(page.locator('input[formcontrolname="email"]').first()).toHaveValue(/@/);
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('simulation screen opens', async ({ page }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('simulation'));
		await expect(page.locator('nb-card').first()).toBeVisible({ timeout: 30_000 });
		expect(errors, errors.join('\n')).toEqual([]);
	});
});
