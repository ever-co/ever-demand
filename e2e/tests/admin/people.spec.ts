import { expect, type Page, test } from '@playwright/test';
import { collectAppErrors, expectTable, login, requireApi, route } from './support';

const rows = (page: Page) => page.locator('ng2-smart-table tbody tr');

test.describe('customers, invites and carriers', () => {
	test.beforeEach(async ({ page }) => {
		await requireApi();
		await login(page);
	});

	test('customers list opens a customer', async ({ page }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('customers/list'));
		await expectTable(page);

		const first = rows(page).first();
		if ((await first.textContent())?.match(/no data found/i)) {
			test.info().annotations.push({ type: 'note', description: 'no customers in this database' });
			return;
		}
		await first.locator('td').nth(2).click();
		await expect(page).toHaveURL(/#\/customers\/list\/[0-9a-f]{24}/, { timeout: 30_000 });
		await expect(page.locator('nb-card').first()).toBeVisible();
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('invites: the inline create row has the country editor and can be cancelled', async ({ page }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('customers/invites'));
		await expectTable(page);

		// the "+" of angular2-smart-table opens the inline create row
		await page.locator('ng2-smart-table .angular2-smart-action-add-add').first().click();
		const form = page
			.locator('ng2-smart-table thead tr')
			.filter({ has: page.locator('.angular2-smart-action-add-create') });
		await expect(form).toBeVisible();
		// custom editor (CountryRenderComponent) lists the countries
		const country = form.locator('select').first();
		await expect(country.locator('option')).not.toHaveCount(0);
		await country.selectOption({ label: 'Bulgaria' });
		// the editor cells line up with the column headers (no extra leading cell)
		const headerCells = await page.locator('ng2-smart-table thead tr.angular2-smart-titles > *').count();
		expect(await form.locator('> td, > th').count()).toBe(headerCells);

		await form.locator('.angular2-smart-action-add-cancel').click();
		await expect(form).toBeHidden();
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('invites: create an invite inline and delete it', async ({ page }) => {
		// Creating an invite geocodes its address with Google Maps, so it needs an admin build
		// with a working GOOGLE_MAPS_API_KEY.
		test.skip(process.env.E2E_GOOGLE_MAPS !== '1', 'set E2E_GOOGLE_MAPS=1 when the admin has a Maps key');
		const errors = collectAppErrors(page);
		const city = `E2E-${Date.now().toString(36)}`;
		await page.goto(route('customers/invites'));
		await expectTable(page);

		await page.locator('ng2-smart-table .angular2-smart-action-add-add').first().click();
		const form = page
			.locator('ng2-smart-table thead tr')
			.filter({ has: page.locator('.angular2-smart-action-add-create') });
		await form.locator('select').first().selectOption({ label: 'Bulgaria' });
		const inputs = form.locator('input');
		// city, street, apartment, house, invite code
		await inputs.nth(0).fill(city);
		await inputs.nth(1).fill('Vitosha');
		await inputs.nth(2).fill('1');
		await inputs.nth(3).fill('2');
		await form.locator('.angular2-smart-action-add-create').click();

		await expect(rows(page).filter({ hasText: city }).first()).toBeVisible({ timeout: 30_000 });

		await rows(page).filter({ hasText: city }).first().locator('input[type="checkbox"]').check();
		await page.locator('nb-card-header button').filter({ hasText: /delete/i }).first().click();
		await expect(rows(page).filter({ hasText: city })).toHaveCount(0, { timeout: 30_000 });
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('carriers list opens a carrier', async ({ page }) => {
		const errors = collectAppErrors(page);
		await page.goto(route('carriers'));
		await expectTable(page);

		const first = rows(page).first();
		if ((await first.textContent())?.match(/no data found/i)) {
			test.info().annotations.push({ type: 'note', description: 'no carriers in this database' });
			return;
		}
		await first.locator('td').nth(2).click();
		await expect(page).toHaveURL(/#\/carriers\/[0-9a-f]{24}/, { timeout: 30_000 });
		expect(errors, errors.join('\n')).toEqual([]);
	});
});
