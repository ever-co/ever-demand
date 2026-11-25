/** Helpers for the admin (packages/admin-web-angular) e2e suite. */
import { expect, type ConsoleMessage, type Page, test } from '@playwright/test';
import { ADMIN, GQL_URL, SERVICES_URL } from '../helpers';

export { ADMIN };

/** Console noise that only means "the API is not running" (or a third party is unreachable). */
const API_DOWN_PATTERNS = [
	/ERR_CONNECTION_REFUSED/i,
	/Failed to load resource/i,
	/net::ERR_/i,
	/localhost:(5500|8443|2086|2087)/,
	/socket\.io/i,
	/WebSocket/i,
	/Http failure response/i,
	/maps\.googleapis\.com|Google Maps JavaScript API/i,
];

export function isApiNoise(text: string): boolean {
	return API_DOWN_PATTERNS.some((re) => re.test(text));
}

/** Collects console errors and uncaught page errors, minus API-unreachable noise. */
export function collectAppErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('console', (msg: ConsoleMessage) => {
		if (msg.type() === 'error' && !isApiNoise(msg.text())) {
			errors.push(msg.text());
		}
	});
	page.on('pageerror', (err) => {
		if (!isApiNoise(String(err))) {
			errors.push(String(err));
		}
	});
	return errors;
}

let apiUp: boolean | undefined;

/** True when the GraphQL API and the socket.io services answer (the lead starts them for e2e runs). */
export async function isApiUp(): Promise<boolean> {
	if (apiUp !== undefined) return apiUp;
	try {
		const [gqlRes, servicesRes] = await Promise.all([
			fetch(GQL_URL, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ query: '{ __typename }' }),
				signal: AbortSignal.timeout(10_000),
			}),
			fetch(SERVICES_URL, { signal: AbortSignal.timeout(10_000) }),
		]);
		apiUp = gqlRes.ok && servicesRes.status < 500;
	} catch {
		apiUp = false;
	}
	return apiUp;
}

/** Skips the current test when no API is running. */
export async function requireApi(): Promise<void> {
	test.skip(!(await isApiUp()), 'needs the Ever Demand API (GraphQL :8443, services :5500)');
}

/** Hash routes: the admin uses `useHash: true`. */
export function route(path: string): string {
	return `/#/${path.replace(/^\/+/, '')}`;
}

export async function login(page: Page, email = ADMIN.email, password = ADMIN.password): Promise<void> {
	await page.goto(route('auth/login'));
	await page.locator('#input-email').fill(email);
	await page.locator('#input-password').fill(password);
	await page.getByRole('button', { name: /log in/i }).click();
	// sign-in-redirect sends the admin to the dashboard, or to the setup when there is no store yet
	await expect(page).toHaveURL(/#\/(dashboard|setup)/, { timeout: 30_000 });
}

/** Waits for the smart table of the current screen to render at least its header. */
export async function expectTable(page: Page): Promise<void> {
	await expect(page.locator('ng2-smart-table table').first()).toBeVisible({ timeout: 30_000 });
}

/** A unique suffix for records created by a test run. */
export function uniq(prefix: string): string {
	return `${prefix}-${Date.now().toString(36)}`;
}
