import { expect, type Page, test } from '@playwright/test';
import { collectAppErrors, expectTable, login, requireApi, route, uniq } from './support';

const modal = (page: Page) => page.locator('ngb-modal-window');

async function expectRow(page: Page, text: string) {
	await expect(page.locator('ng2-smart-table tbody tr').filter({ hasText: text }).first()).toBeVisible({
		timeout: 30_000,
	});
}

test.describe('products and categories', () => {
	test.describe.configure({ mode: 'serial' });

	const category = uniq('e2e-category');
	const product = uniq('e2e-product');

	test.beforeEach(async ({ page }) => {
		await requireApi();
		await login(page);
	});

	test('creates a product category', async ({ page }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('products/categories'));
		await expectTable(page);

		await page.locator('nb-card-header button').filter({ hasText: /create/i }).click();
		const dialog = modal(page);
		await dialog.locator('input[formcontrolname="name"]').fill(category);
		await dialog.getByRole('button', { name: 'Done' }).click();
		await expect(dialog).toBeHidden({ timeout: 30_000 });

		await expectRow(page, category);
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('creates a product in that category', async ({ page, baseURL }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('products/list'));
		await expectTable(page);

		await page.locator('nb-card-header button').filter({ hasText: /create/i }).click();
		const dialog = modal(page);
		await expect(dialog.locator('form-wizard')).toBeVisible();

		await dialog.locator('input[formcontrolname="title"]').fill(product);
		await dialog.locator('[formcontrolname="description"]').fill(`${product} description`);
		await dialog.locator('select[formcontrolname="locale"]').selectOption({ index: 1 });
		// a picture the admin itself serves, so no upload service is needed
		const picture = dialog.locator('e-cu-file-uploader input[type="text"]');
		await picture.fill(`${baseURL}/assets/images/google-map-customer-marker.png`);
		await picture.dispatchEvent('change');

		// categories use ng-select (multiple) instead of the old ss-multiselect-dropdown
		await dialog.locator('ng-select[formcontrolname="selectedProductCategories"]').click();
		await page.locator('ng-dropdown-panel .ng-option').filter({ hasText: category }).first().click();
		await page.keyboard.press('Escape');

		await expect(dialog.getByRole('button', { name: 'Done' })).toBeEnabled({ timeout: 30_000 });
		await dialog.getByRole('button', { name: 'Done' }).click();
		await expect(dialog).toBeHidden({ timeout: 30_000 });

		await expectRow(page, product);
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('opens the product page', async ({ page }) => {
		await page.goto(route('products/list'));
		await expectTable(page);
		await page.locator('ng2-smart-table tbody tr').filter({ hasText: product }).first().locator('td').nth(2).click();
		await expect(page).toHaveURL(/#\/products\/list\/[0-9a-f]{24}/, { timeout: 30_000 });
		await expect(page.locator('input[formcontrolname="title"]').first()).toHaveValue(product, {
			timeout: 30_000,
		});
		// the category picked with ng-select is shown on the product
		await expect(page.locator('ng-select').getByText(category)).toBeVisible();
	});
});
