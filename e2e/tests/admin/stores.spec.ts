import { expect, type Page, test } from '@playwright/test';
import { collectAppErrors, expectTable, login, requireApi, route, uniq } from './support';

/** The open ng-bootstrap modal. */
const modal = (page: Page) => page.locator('ngb-modal-window');

/** Types into the smart table filter of a column (by its placeholder) and waits for the row. */
async function filterTable(page: Page, placeholder: string, value: string) {
	await page.locator(`ng2-smart-table input[placeholder="${placeholder}"]`).first().fill(value);
	await expect(page.locator('ng2-smart-table tbody tr').filter({ hasText: value }).first()).toBeVisible({
		timeout: 30_000,
	});
}

test.describe('stores', () => {
	test.describe.configure({ mode: 'serial' });

	const storeName = uniq('e2e-store');
	const renamed = `${storeName}-renamed`;

	test.beforeEach(async ({ page }) => {
		await requireApi();
		await login(page);
	});

	test('lists the stores', async ({ page }) => {
		await page.goto(route('stores'));
		await expectTable(page);
		for (const column of ['Name', 'Email', 'Phone', 'City', 'Address']) {
			await expect(page.locator('ng2-smart-table th').filter({ hasText: column }).first()).toBeVisible();
		}
	});

	test('creates a store through the wizard', async ({ page }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('stores'));
		await expectTable(page);

		await page.locator('nb-card-header button').filter({ hasText: /create/i }).click();
		const dialog = modal(page);
		await expect(dialog.locator('form-wizard')).toBeVisible();

		// 1. basic info
		await dialog.locator('input[formcontrolname="name"]').fill(storeName);
		await dialog.locator('input[formcontrolname="username"]').fill(storeName);
		await dialog.locator('input[type="password"]').first().fill('e2e-password');
		await dialog.getByRole('button', { name: 'Next' }).click();

		// 2. contact info (all optional)
		await dialog.getByRole('button', { name: 'Next' }).click();

		// 3. location, typed in by hand (no Google autocomplete needed)
		await dialog.locator('select[formcontrolname="countryId"]').selectOption({ label: 'Bulgaria' });
		await dialog.locator('input[formcontrolname="city"]').fill('Sofia');
		await dialog.locator('input[formcontrolname="streetAddress"]').fill('Vitosha');
		await dialog.locator('input[formcontrolname="house"]').fill('1');
		// the Coordinates checkbox shows the latitude / longitude inputs
		await dialog.locator('.row').filter({ hasText: 'Coordinates' }).locator('input[type="checkbox"]').first().check();
		await dialog.locator('input[formcontrolname="0"]').fill('42.6977');
		await dialog.locator('input[formcontrolname="1"]').fill('23.3219');
		await dialog.getByRole('button', { name: 'Next' }).click();

		// 4. payments (off by default) -> Done
		await dialog.getByRole('button', { name: 'Done' }).click();
		await expect(dialog).toBeHidden({ timeout: 30_000 });

		await filterTable(page, 'Name', storeName);
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('opens and edits the store', async ({ page }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('stores'));
		await expectTable(page);
		await filterTable(page, 'Name', storeName);

		// the store name (RedirectNameComponent render cell) links to the store page
		await page
			.locator('ng2-smart-table tbody tr')
			.filter({ hasText: storeName })
			.first()
			.locator('.redirectBtn')
			.first()
			.click();
		await expect(page).toHaveURL(/#\/stores\/[0-9a-f]{24}/, { timeout: 30_000 });

		await page.getByRole('button', { name: /manage store/i }).click();
		await expect(page).toHaveURL(/#\/stores\/[0-9a-f]{24}\/manage/, { timeout: 30_000 });
		const name = page.locator('input[formcontrolname="name"]').first();
		await expect(name).toHaveValue(storeName, { timeout: 30_000 });
		await name.fill(renamed);
		await page.getByRole('button', { name: /save/i }).click();

		await page.goto(route('stores'));
		await expectTable(page);
		await filterTable(page, 'Name', renamed);
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('deletes the store', async ({ page }) => {
		await page.goto(route('stores'));
		await expectTable(page);
		await filterTable(page, 'Name', renamed);

		const row = page.locator('ng2-smart-table tbody tr').filter({ hasText: renamed }).first();
		await row.locator('input[type="checkbox"]').check();
		await page.locator('nb-card-header button').filter({ hasText: /delete/i }).click();
		// "Are you sure?" confirmation modal
		await modal(page).getByRole('button', { name: /yes/i }).click();

		await expect(page.locator('ng2-smart-table tbody tr').filter({ hasText: renamed })).toHaveCount(0, {
			timeout: 30_000,
		});
	});
});
