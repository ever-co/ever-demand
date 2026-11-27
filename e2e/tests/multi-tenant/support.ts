/**
 * Helpers for the multi-tenant admin suite: the admin app (E2E_MT_ADMIN_URL) against an API
 * that runs with MULTI_TENANT=true (E2E_MT_GQL_URL).
 */
import { randomUUID } from 'node:crypto';
import { expect, type Page, test } from '@playwright/test';
import { route } from '../admin/support';

export { collectAppErrors, expectTable, route } from '../admin/support';

export const MT_GQL_URL =
	process.env.E2E_MT_GQL_URL || 'http://localhost:8443/graphql';

/** The platform super-admin the API creates on first boot (non-production). */
export const SUPER_ADMIN = {
	email: process.env.E2E_MT_SUPER_ADMIN_EMAIL || 'admin@ever.co',
	password: process.env.E2E_MT_SUPER_ADMIN_PASSWORD || 'admin',
};

let multiTenant: boolean | undefined;

/**
 * True when the API answers and runs as a multi-tenant SaaS: an anonymous request names no
 * tenant there, so `currentTenant` is null (a single-tenant API answers its default tenant).
 */
export async function isMultiTenantApiUp(): Promise<boolean> {
	if (multiTenant !== undefined) return multiTenant;
	try {
		const res = await fetch(MT_GQL_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				query: '{ currentTenant { slug } tenantPlans { plan } }',
			}),
			signal: AbortSignal.timeout(10_000),
		});
		const body: any = await res.json();
		multiTenant =
			res.ok &&
			body?.data?.currentTenant === null &&
			body?.data?.tenantPlans?.length > 0;
	} catch {
		multiTenant = false;
	}
	return multiTenant;
}

export async function requireMultiTenantApi(): Promise<void> {
	test.skip(
		!(await isMultiTenantApiUp()),
		`needs the Ever Demand API with MULTI_TENANT=true at ${MT_GQL_URL} (E2E_MT_GQL_URL)`,
	);
}

export interface TenantAccount {
	business: string;
	slug: string;
	email: string;
	password: string;
	store: string;
	product: string;
}

/** A tenant with names no other run uses. */
export function newTenant(letter: string): TenantAccount {
	const run = `${Date.now().toString(36)}${randomUUID().slice(0, 3)}`;
	const key = `${letter.toLowerCase()}${run}`;
	return {
		business: `MT ${letter.toUpperCase()} ${run}`,
		// what the signup suggests from the business name
		slug: `mt-${letter.toLowerCase()}-${run}`,
		email: `owner.${key}@mt-e2e.example`,
		password: `pw-${key}-secret`,
		store: `mt-store-${key}`,
		product: `mt-product-${key}`,
	};
}

/** Logs in on the login page; lands on the dashboard or (no store yet) the setup. */
export async function loginAs(
	page: Page,
	email: string,
	password: string,
): Promise<void> {
	await page.goto(route('auth/login'));
	await page.locator('#input-email').fill(email);
	await page.locator('#input-password').fill(password);
	await page.getByRole('button', { name: /log in/i }).click();
	await expect(page).toHaveURL(/#\/(dashboard|setup)/, { timeout: 30_000 });
}

/** Logs out (clears the session and the super-admin's switch). */
export async function logout(page: Page): Promise<void> {
	await page.goto(route('auth/logout'));
	await expect(page).toHaveURL(/#\/(auth|$)/, { timeout: 30_000 });
	await expect
		.poll(() => page.evaluate(() => localStorage.getItem('token')))
		.toBeFalsy();
}

/** The open ng-bootstrap modal. */
export const modal = (page: Page) => page.locator('ngb-modal-window');

/** Rows of the smart table on screen that contain `text`. */
export const rowsWith = (page: Page, text: string) =>
	page.locator('ng2-smart-table tbody tr').filter({ hasText: text });

/**
 * Opens a smart-table screen and waits for a column only that screen has: a hash navigation
 * keeps the previous screen (and its table and buttons) in the page until the lazy module of
 * the next one has loaded.
 */
export async function openTable(
	page: Page,
	path: string,
	column: string,
): Promise<void> {
	await page.goto(route(path));
	await expect(
		page.locator('ng2-smart-table th').filter({ hasText: column }).first(),
	).toBeVisible({
		timeout: 30_000,
	});
}

/** Types into the smart table filter of a column (by its placeholder). */
export async function filterTable(
	page: Page,
	placeholder: string,
	value: string,
): Promise<void> {
	await page
		.locator(`ng2-smart-table input[placeholder="${placeholder}"]`)
		.first()
		.fill(value);
}

/** Creates a store through the stores wizard (the same steps as tests/admin/stores.spec.ts). */
export async function createStore(page: Page, name: string): Promise<void> {
	await openTable(page, 'stores', 'Email');

	await page
		.locator('nb-card-header button')
		.filter({ hasText: /create/i })
		.click();
	const dialog = modal(page);
	await expect(dialog.locator('form-wizard')).toBeVisible();

	await dialog.locator('input[formcontrolname="name"]').fill(name);
	await dialog.locator('input[formcontrolname="username"]').fill(name);
	await dialog.locator('input[type="password"]').first().fill('e2e-password');
	await dialog.getByRole('button', { name: 'Next' }).click();

	await dialog.getByRole('button', { name: 'Next' }).click();

	await dialog
		.locator('select[formcontrolname="countryId"]')
		.selectOption({ label: 'Bulgaria' });
	await dialog.locator('input[formcontrolname="city"]').fill('Sofia');
	await dialog
		.locator('input[formcontrolname="streetAddress"]')
		.fill('Vitosha');
	await dialog.locator('input[formcontrolname="house"]').fill('1');
	await dialog
		.locator('.row')
		.filter({ hasText: 'Coordinates' })
		.locator('input[type="checkbox"]')
		.first()
		.check();
	await dialog.locator('input[formcontrolname="0"]').fill('42.6977');
	await dialog.locator('input[formcontrolname="1"]').fill('23.3219');
	await dialog.getByRole('button', { name: 'Next' }).click();

	await dialog.getByRole('button', { name: 'Done' }).click();
	await expect(dialog).toBeHidden({ timeout: 30_000 });

	await filterTable(page, 'Name', name);
	await expect(rowsWith(page, name).first()).toBeVisible({ timeout: 30_000 });
}

/** Creates a product through the products wizard (as tests/admin/catalog.spec.ts, no category). */
export async function createProduct(
	page: Page,
	title: string,
	baseURL: string,
): Promise<void> {
	await openTable(page, 'products/list', 'Images');

	await page
		.locator('nb-card-header button')
		.filter({ hasText: /create/i })
		.click();
	const dialog = modal(page);
	await expect(dialog.locator('form-wizard')).toBeVisible();

	await dialog.locator('input[formcontrolname="title"]').fill(title);
	await dialog
		.locator('[formcontrolname="description"]')
		.fill(`${title} description`);
	await dialog
		.locator('select[formcontrolname="locale"]')
		.selectOption({ index: 1 });
	const picture = dialog.locator('e-cu-file-uploader input[type="text"]');
	await picture.fill(
		`${baseURL}/assets/images/google-map-customer-marker.png`,
	);
	await picture.dispatchEvent('change');

	await expect(dialog.getByRole('button', { name: 'Done' })).toBeEnabled({
		timeout: 30_000,
	});
	await dialog.getByRole('button', { name: 'Done' }).click();
	await expect(dialog).toBeHidden({ timeout: 30_000 });

	await expect(rowsWith(page, title).first()).toBeVisible({
		timeout: 30_000,
	});
}
