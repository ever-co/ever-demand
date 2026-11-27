import { expect, type Page, test } from '@playwright/test';
import {
	collectAppErrors,
	createProduct,
	createStore,
	filterTable,
	openTable,
	loginAs,
	logout,
	newTenant,
	requireMultiTenantApi,
	route,
	rowsWith,
	SUPER_ADMIN,
	type TenantAccount,
} from './support';

/**
 * Multi-tenant SaaS in the admin app (docs/multi-tenant/DESIGN.md §6, §8): two businesses sign
 * up in the UI and never see each other's stores or products; the platform super-admin
 * switches into one of them with the header's tenant switcher.
 *
 * Needs the API with MULTI_TENANT=true (E2E_MT_GQL_URL) and an admin build that talks to it
 * (E2E_MT_ADMIN_URL), with TENANT_BASE_DOMAIN=everdemand.test.
 */
const BASE_DOMAIN = process.env.E2E_MT_BASE_DOMAIN || 'everdemand.test';

async function signUp(page: Page, tenant: TenantAccount): Promise<void> {
	// the login page's "Register" link opens the signup
	await page.goto(route('auth/login'));
	const register = page.getByRole('link', { name: 'Register' });
	await expect(register).toHaveAttribute('href', '#/auth/register');
	// keyboard, not a mouse click: leaving the autofocused email field shows its error message
	// and moves the link away from under the pointer
	await register.focus();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/#\/auth\/signup/);
	await expect(
		page.getByRole('heading', { name: 'Create your business' }),
	).toBeVisible();

	await page.locator('#input-business').fill(tenant.business);
	// the address is suggested from the business name and checked live
	await expect(page.locator('#input-slug')).toHaveValue(tenant.slug);
	await expect(page.locator('[data-test="slug-status"]')).toHaveText(
		'This address is free',
		{
			timeout: 15_000,
		},
	);
	await expect(page.locator('[data-test="shop-address"]')).toHaveText(
		`${tenant.slug}.${BASE_DOMAIN}`,
	);

	await page.locator('#input-first-name').fill('Olga');
	await page.locator('#input-last-name').fill('Owner');
	await page.locator('#input-email').fill(tenant.email);
	await page.locator('#input-password').fill(tenant.password);
	// Starter (free) is the default plan
	await expect(page.locator('#plan-starter')).toBeChecked();

	await page.locator('#signup-submit').click();
	await expect(page).toHaveURL(/#\/dashboard/, { timeout: 30_000 });
	await expect(page.locator('ngx-header')).toBeVisible();
	expect(
		await page.evaluate(() => localStorage.getItem('token')),
	).toBeTruthy();
	// a tenant owner is no super-admin: no tenant switcher, and no Tenant-Id ever
	await expect(page.locator('#tenant-switcher')).toHaveCount(0);
}

/** The stores list of the tenant on screen has loaded (with at least `known`). */
async function expectStoresListed(page: Page, known: string): Promise<void> {
	await openTable(page, 'stores', 'Email');
	await filterTable(page, 'Name', known);
	await expect(rowsWith(page, known).first()).toBeVisible({
		timeout: 30_000,
	});
}

async function expectStoreNotListed(page: Page, name: string): Promise<void> {
	await filterTable(page, 'Name', name);
	await expect(rowsWith(page, name)).toHaveCount(0, { timeout: 15_000 });
}

test.describe('multi-tenant admin', () => {
	// one flow: A, then B, then the super-admin (each step builds on the one before)
	test.describe.configure({ mode: 'serial', timeout: 180_000 });

	const a = newTenant('a');
	const b = newTenant('b');

	test.beforeEach(async () => {
		await requireMultiTenantApi();
	});

	test('a business signs up in the UI (tenant A)', async ({ page }) => {
		const errors = collectAppErrors(page);
		await signUp(page, a);
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('tenant A creates a store and a product, and sees its settings', async ({
		page,
		baseURL,
	}) => {
		const errors = collectAppErrors(page);
		await loginAs(page, a.email, a.password);

		await createStore(page, a.store);
		await createProduct(page, a.product, baseURL!);

		// Settings → Business: the address and the shop address
		await page.goto(route('settings/tenant'));
		await expect(page.locator('[data-test="tenant-slug"]')).toHaveText(
			a.slug,
			{ timeout: 30_000 },
		);
		await expect(page.locator('[data-test="shop-address"]')).toContainText(
			`${a.slug}.${BASE_DOMAIN}`,
		);
		await expect(page.locator('#tenant-name')).toHaveValue(a.business);

		// Settings → Billing: Starter, one store of three
		await page.goto(route('settings/billing'));
		await expect(page.locator('[data-test="current-plan"]')).toHaveText(
			'Starter',
			{ timeout: 30_000 },
		);
		await expect(page.locator('[data-test="stores-usage"]')).toHaveText(
			'1 of 3',
		);
		// the owner may buy a plan
		await expect(page.locator('#billing-upgrade')).toBeVisible();

		// Settings → Members: the owner, who cannot remove themselves
		await page.goto(route('settings/members'));
		const owner = page.locator(`tr[data-member="${a.email}"]`);
		await expect(owner).toContainText('Owner', { timeout: 30_000 });
		await expect(owner.locator('button')).toHaveCount(0);

		expect(errors, errors.join('\n')).toEqual([]);
	});

	test("tenant B signs up and sees none of A's stores or products", async ({
		page,
	}) => {
		const errors = collectAppErrors(page);
		await signUp(page, b);

		// B's own store shows, A's does not
		await createStore(page, b.store);
		await expectStoresListed(page, b.store);
		await expectStoreNotListed(page, a.store);

		await openTable(page, 'products/list', 'Images');
		await expect(rowsWith(page, a.product)).toHaveCount(0, {
			timeout: 15_000,
		});

		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('the super-admin switches into tenant A and sees its store', async ({
		page,
	}) => {
		const errors = collectAppErrors(page);
		await loginAs(page, SUPER_ADMIN.email, SUPER_ADMIN.password);

		const switcher = page.locator('#tenant-switcher');
		await expect(switcher).toBeVisible({ timeout: 30_000 });
		await expect(switcher.locator(`option[value="${a.slug}"]`)).toHaveCount(
			1,
			{ timeout: 30_000 },
		);

		// on the platform tenant: neither A's nor B's store
		await openTable(page, 'stores', 'Email');
		await expectStoreNotListed(page, a.store);

		await switcher.selectOption(a.slug);
		// the screens load again in A (A has a store: the dashboard)
		await expect(page).toHaveURL(/#\/dashboard/, { timeout: 30_000 });
		await expect
			.poll(() =>
				page.evaluate(() => localStorage.getItem('_superAdminTenant')),
			)
			.toBe(a.slug);

		await expectStoresListed(page, a.store);
		await expectStoreNotListed(page, b.store);

		await openTable(page, 'products/list', 'Images');
		await expect(rowsWith(page, a.product).first()).toBeVisible({
			timeout: 30_000,
		});

		// the super-admin's own profile still loads while acting in A
		await expect(page.locator('ngx-header nb-user')).toBeVisible();

		// back to "Platform (default)"; the screens load again (dashboard, or setup without a store)
		await page.locator('#tenant-switcher').selectOption('');
		await expect
			.poll(() =>
				page.evaluate(() => localStorage.getItem('_superAdminTenant')),
			)
			.toBeNull();
		await expect(page).toHaveURL(/#\/(dashboard|setup)/, {
			timeout: 30_000,
		});
		await openTable(page, 'stores', 'Email');
		await expectStoreNotListed(page, a.store);

		await logout(page);
		expect(errors, errors.join('\n')).toEqual([]);
	});
});
