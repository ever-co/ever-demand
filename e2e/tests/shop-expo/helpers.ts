/** Helpers for the Expo shop app (web build, react-native-web: `testID` becomes `data-testid`). */
import type { ConsoleMessage, Page } from '@playwright/test';
import { io } from 'socket.io-client';
import { SERVICES_URL } from '../helpers';

/** Sofia, the app's default coordinates. */
export const SOFIA = { latitude: 42.6459136, longitude: 23.3332736 };

/** The dev invite code (`FAKE_INVITE_CODE`): registers a customer in Sofia without a server invite. */
export const FAKE_INVITE_CODE = '8321';

/** Key under which the app keeps its session (AsyncStorage → localStorage on the web). */
export const SESSION_KEY = 'ever-shop-session';

export async function isApiUp(): Promise<boolean> {
	try {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 3000);
		await fetch(SERVICES_URL, { signal: controller.signal });
		clearTimeout(timer);
		return true;
	} catch {
		return false;
	}
}

/** Console errors that only say the API is not there (tolerated when it is down). */
const API_UNREACHABLE = [
	/ERR_CONNECTION_REFUSED/,
	/Failed to load resource/,
	/WebSocket connection to .* failed/,
	/Could not load the server settings/,
	/Could not register the device/,
	/net::ERR_/,
];

/** Collects console errors and uncaught exceptions. */
export function watchConsole(page: Page) {
	const errors: string[] = [];
	page.on('console', (message: ConsoleMessage) => {
		if (message.type() === 'error') {
			errors.push(message.text());
		}
	});
	page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
	return {
		errors,
		/** Errors that are not about an unreachable API. */
		unexpected: () => errors.filter((text) => !API_UNREACHABLE.some((pattern) => pattern.test(text))),
	};
}

/** Starts with a clean session (no user, no order). */
export async function freshSession(page: Page) {
	await page.goto('/');
	await page.evaluate(() => window.localStorage.clear());
}

/** Waits for the first page after start: an invite page, or the feed ("browse first" mode). */
export async function firstPage(page: Page): Promise<'invite' | 'products'> {
	const invite = page.getByTestId('invite-by-code-screen').or(page.getByTestId('invite-by-location-screen'));
	const products = page.getByTestId('products-screen');
	await invite.or(products).first().waitFor();
	return (await products.isVisible()) ? 'products' : 'invite';
}

/** On an invite page: registers with the dev code (or by address when the invite system is off). */
export async function completeInvite(page: Page) {
	const byLocation = page.getByTestId('invite-by-location-screen');
	await page.getByTestId('invite-by-code-screen').or(byLocation).first().waitFor();
	if (await byLocation.isVisible()) {
		await page.getByTestId('city-input').fill('Sofia');
		await page.getByTestId('street-input').fill('Simeonovsko shose');
		await page.getByTestId('house-input').fill('104');
		await page.getByTestId('apartment-input').fill('3');
		await page.getByTestId('get-in-button').click();
	} else {
		await page.getByTestId('invite-code-input').fill(FAKE_INVITE_CODE);
	}
}

/**
 * A fresh visitor reaches the product feed: through the invite when the server requires
 * registration, directly otherwise (registration then happens on the first Buy).
 */
export async function openShop(page: Page): Promise<{ registered: boolean }> {
	await freshSession(page);
	await page.goto('/');
	if ((await firstPage(page)) === 'invite') {
		await completeInvite(page);
		await page.getByTestId('products-screen').waitFor();
		return { registered: true };
	}
	return { registered: false };
}

/** Registers a customer at the dev invite address through the pyro `user-auth.register` call. */
export async function registerViaApi(): Promise<string> {
	const socket = io(`${SERVICES_URL}/user-auth`, { transports: ['websocket'], reconnection: false });
	try {
		const user = await new Promise<{ _id: string }>((resolve, reject) => {
			socket.emit(
				'register',
				{
					user: {
						apartment: '3',
						geoLocation: {
							loc: { type: 'Point', coordinates: [SOFIA.longitude, SOFIA.latitude] },
							countryId: 21,
							city: 'Sofia',
							postcode: '1700',
							streetAddress: 'Simeonovsko shose',
							house: '104',
						},
					},
				},
				(err: unknown, res: { _id: string }) => (err ? reject(err) : resolve(res)),
			);
			setTimeout(() => reject(new Error('register timed out')), 15000);
		});
		return user._id;
	} finally {
		socket.close();
	}
}

/** A registered customer on the feed, whatever the server registration setting. */
export async function registeredCustomer(page: Page) {
	const { registered } = await openShop(page);
	if (!registered) {
		// "Browse first" mode: register through the API and reload as that customer.
		const userId = await registerViaApi();
		await page.evaluate(
			([key, id]) => {
				const session = JSON.parse(window.localStorage.getItem(key) || '{}');
				window.localStorage.setItem(key, JSON.stringify({ ...session, userId: id }));
			},
			[SESSION_KEY, userId],
		);
		await page.goto('/products');
		await page.getByTestId('products-screen').waitFor();
	}
}
