/**
 * Helpers for the shop-mobile (Ionic) suite: talk to the API the way the app does
 * (pyro socket.io RPC + GraphQL) and seed the app's localStorage keys.
 */
import { expect, type ConsoleMessage, type Page } from '@playwright/test';
import { io } from 'socket.io-client';
import { gql, GQL_URL, SERVICES_URL } from '../helpers';

/** Default location of the app's env (Sofia), also used by the fake invite. */
export const SOFIA = { lat: 42.6459136, lng: 23.3332736 };

/** True when the pyro API answers (any HTTP status). */
export async function apiIsUp(): Promise<boolean> {
	try {
		await fetch(SERVICES_URL, { signal: AbortSignal.timeout(3000) });
		await fetch(GQL_URL, {
			method: 'GET',
			signal: AbortSignal.timeout(3000),
		});
		return true;
	} catch {
		return false;
	}
}

/**
 * One pyro RPC call: the namespace is the router name, the reply comes through the
 * socket.io ack `(err, result)` (see docs/latest-stack/shop-mobile-features.md 1.2).
 */
export async function pyro<T = any>(
	router: string,
	method: string,
	...args: unknown[]
): Promise<T> {
	const socket = io(`${SERVICES_URL}/${router}`, {
		transports: ['websocket'],
		reconnection: false,
	});
	try {
		return await new Promise<T>((resolve, reject) => {
			const timer = setTimeout(
				() => reject(new Error(`${router}.${method} timed out`)),
				20_000,
			);
			socket.on('connect_error', (err) => {
				clearTimeout(timer);
				reject(err);
			});
			socket.emit(method, ...args, (err: any, res: T) => {
				clearTimeout(timer);
				if (err != null)
					reject(
						Object.assign(new Error(err.message || String(err)), {
							name: err.name,
						}),
					);
				else resolve(res);
			});
		});
	} finally {
		socket.disconnect();
	}
}

/** Registers a customer at the default location, like "invite by location" does. */
export async function registerCustomer(): Promise<{
	_id: string;
	id?: string;
}> {
	return pyro('user-auth', 'register', {
		user: {
			apartment: '3',
			geoLocation: {
				loc: { type: 'Point', coordinates: [SOFIA.lng, SOFIA.lat] },
				countryId: 21,
				city: 'Sofia',
				streetAddress: 'Simeonovsko shose',
				house: '104',
				postcode: '1700',
			},
		},
	});
}

/** Products the feed would show at the default location (delivery or takeaway). */
export async function productsNearSofia(takeaway = false): Promise<any[]> {
	const res = await gql(
		`query ($geoLocation: GeoLocationFindInput!, $options: GetGeoLocationProductsOptions, $pagingOptions: PagingOptionsInput) {
			geoLocationProductsByPaging(geoLocation: $geoLocation, options: $options, pagingOptions: $pagingOptions) {
				warehouseId
				warehouseProduct { id count isProductAvailable product { id } }
			}
		}`,
		{
			geoLocation: {
				loc: { type: 'Point', coordinates: [SOFIA.lng, SOFIA.lat] },
			},
			options: {
				isDeliveryRequired: !takeaway,
				isTakeaway: takeaway,
				withoutCount: true,
			},
			pagingOptions: { skip: 0, limit: 10 },
		},
	);
	return (res.data?.geoLocationProductsByPaging ?? []).filter(
		(p: any) =>
			p &&
			p.warehouseProduct?.isProductAvailable &&
			p.warehouseProduct.count !== 0,
	);
}

/** Seeds the app's localStorage before any page script runs. */
export async function seedStorage(
	page: Page,
	values: Record<string, string>,
): Promise<void> {
	await page.addInitScript((entries) => {
		// Only on the first load of the test: later reloads keep what the app wrote.
		if (sessionStorage.getItem('__e2e_seeded')) return;
		for (const [key, value] of Object.entries(entries))
			localStorage.setItem(key, value);
		sessionStorage.setItem('__e2e_seeded', '1');
	}, values);
}

/**
 * Console errors the app may log without being broken: the API or Google being
 * unreachable from the test machine, and Google Maps without an API key.
 */
const EXPECTED_ERRORS = [
	/ERR_CONNECTION_REFUSED/i,
	/Failed to load resource/i,
	/net::ERR_/i,
	/WebSocket connection to .* failed/i,
	/websocket error|xhr poll error|transport (close|error)/i,
	/Http failure response/i,
	/Google Maps JavaScript API/i,
	/maps\.googleapis\.com/i,
	/Network was disconnected/i,
];

/** Collects console errors and page errors that are not in EXPECTED_ERRORS. */
export function watchConsole(page: Page): () => string[] {
	const unexpected: string[] = [];
	const keep = (text: string) => {
		if (!EXPECTED_ERRORS.some((re) => re.test(text))) unexpected.push(text);
	};
	page.on('console', (msg: ConsoleMessage) => {
		if (msg.type() === 'error') keep(msg.text());
	});
	page.on('pageerror', (err) => keep(`${err.name}: ${err.message}`));
	return () => unexpected;
}

/** Waits until Ionic has rendered the app shell. */
export async function expectAppShell(page: Page): Promise<void> {
	await expect(page.locator('ion-app')).toBeAttached();
	await expect(
		page.locator('ion-app.hydrated, ion-app[class*="hydrated"]'),
	).toBeAttached({ timeout: 30_000 });
}
