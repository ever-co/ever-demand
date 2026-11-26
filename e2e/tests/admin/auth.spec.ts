import { expect, test } from '@playwright/test';
import { ADMIN, collectAppErrors, login, requireApi, route } from './support';

test.describe('admin sign in', () => {
	test.beforeEach(async () => {
		await requireApi();
	});

	test('the default admin signs in and lands on the dashboard (or the setup)', async ({ page }) => {
		const errors = collectAppErrors(page);

		await login(page);

		await expect(page).toHaveURL(/#\/(dashboard|setup)/);
		await expect(page.locator('ngx-header, ea-header').first()).toBeVisible();
		// the session token is kept for the GraphQL auth link
		const token = await page.evaluate(() => localStorage.getItem('token'));
		expect(token, 'token in localStorage').toBeTruthy();
		expect(errors, errors.join('\n')).toEqual([]);
	});

	test('a wrong password keeps the admin on the login page', async ({ page }) => {
		await page.goto(route('auth/login'));
		await page.locator('#input-email').fill(ADMIN.email);
		await page.locator('#input-password').fill('definitely-not-the-password');
		await page.getByRole('button', { name: /log in/i }).click();

		await expect(page.locator('nb-alert, .alert-danger, [role="alert"]').first()).toBeVisible({
			timeout: 15_000,
		});
		await expect(page).toHaveURL(/#\/auth/);
		expect(await page.evaluate(() => localStorage.getItem('token'))).toBeFalsy();
	});

	test('a signed-out visitor is sent to the login page', async ({ page }) => {
		await page.goto(route('auth/login'));
		await page.evaluate(() => localStorage.removeItem('token'));
		await page.goto(route('stores'));
		await expect(page).toHaveURL(/#\/auth/, { timeout: 30_000 });
	});
});
