import { expect, test } from '@playwright/test';
import { collectAppErrors, route } from './support';

// Runs with or without the API: the app shell must boot and never throw.

test('the app shell boots without console errors', async ({ page }) => {
	const errors = collectAppErrors(page);

	await page.goto(route('auth/login'));
	await expect(page).toHaveTitle(/Ever Admin/);

	// API up: the Nebular login form renders.
	// API down: the server-connection check sends the admin to the "server down" page.
	const loginForm = page.locator('#input-email');
	await expect(loginForm.or(page.locator('ea-server-down, ion-content, .server-down')).first())
		.toBeVisible({ timeout: 30_000 })
		.catch(() => undefined);

	if (await loginForm.isVisible()) {
		await expect(page.locator('#input-password')).toBeVisible();
		await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
	} else {
		await expect(page).toHaveURL(/#\/server-down/, { timeout: 30_000 });
	}

	// the index.html loading text is gone once Angular has rendered
	await expect(page.locator('ea-app')).not.toHaveText('Loading...');
	expect(errors, errors.join('\n')).toEqual([]);
});

test('static assets are served', async ({ request }) => {
	for (const path of ['/assets/i18n/en-US.json', '/favicon.ico']) {
		const res = await request.get(path);
		expect(res.status(), path).toBe(200);
	}
	const i18n = await (await request.get('/assets/i18n/en-US.json')).json();
	expect(i18n).toHaveProperty('MENU_VIEW');
});
