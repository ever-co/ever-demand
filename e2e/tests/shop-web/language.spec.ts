import { expect, test } from '@playwright/test';
import { API_REQUIRED, apiIsUp, openShop } from './support';

const HEBREW = /[֐-׿]/;

/** First visit: the shop speaks the browser's language (a fleet fix, T-2745). */
test.describe('shop web: language on the first visit', () => {
	test.describe('Hebrew browser', () => {
		test.use({ locale: 'he-IL' });

		test('shows the shop in Hebrew, right to left', async ({ page }) => {
			await openShop(page);

			await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
			await expect(page.locator('html')).toHaveAttribute('lang', 'he');
			await expect(page.locator('body')).toContainText(HEBREW);
		});
	});

	test.describe('Canadian French browser', () => {
		test.use({ locale: 'fr-CA' });

		test('shows the shop in French, left to right', async ({ page }) => {
			await openShop(page);

			await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
			await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
		});
	});

	test.describe('German browser (no German catalogue)', () => {
		test.use({ locale: 'de-DE' });

		test('falls back to English', async ({ page }) => {
			await openShop(page);

			await expect(page.locator('html')).toHaveAttribute('lang', 'en');
			await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
		});
	});
});

test.describe('shop web: settings', () => {
	test.use({ locale: 'en-US' });

	test('switches the language to Hebrew and back', async ({ page }) => {
		test.skip(!(await apiIsUp()), API_REQUIRED);

		await openShop(page, '/settings');
		await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

		await page.locator('mat-select').click();
		await page.getByRole('option', { name: 'he-IL' }).click();
		await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
		await expect(page.locator('body')).toContainText(HEBREW);
		// the first panel closes with an animation: a click on the select before it is gone does
		// not open a new one, and the option found is the closing panel's (detached right after)
		await expect(page.getByRole('listbox')).toBeHidden();

		await page.locator('mat-select').click();
		await page.getByRole('option', { name: 'en-US' }).click();
		await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
		await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
	});
});
