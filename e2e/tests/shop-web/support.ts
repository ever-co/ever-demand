/**
 * Helpers for the shop-web (Angular) e2e suite.
 *
 * - `stubGoogleMaps(page)`: the shop waits for the Google Maps JS API before it boots
 *   (GoogleMapsLoader app initializer). The stub answers the script request with a tiny
 *   offline `google.maps`, so the suite needs neither the internet nor an API key, and the
 *   geocoder never fills the address form behind the test's back.
 * - `apiIsUp()`: the specs that need the upgraded API skip themselves until it runs.
 * - `seedStoreWithProduct()` / `removeSeed()`: a store with one product, right at the
 *   shop's default location (DEFAULT_LATITUDE / DEFAULT_LONGITUDE of scripts/env.ts).
 */
import type { Page } from '@playwright/test';
import { ADMIN, GQL_URL, SERVICES_URL, gql } from '../helpers';

/** Default location of the shop (packages/shop-web-angular/scripts/env.ts). */
export const DEFAULT_LOCATION = { lat: 42.6459136, lng: 23.3332736 };

/** `Country.BG` of packages/common/src/entities/GeoLocation.ts. */
export const COUNTRY_BG = 21;

const GOOGLE_MAPS_STUB = `
(function () {
	function absorb(target) {
		return new Proxy(target, {
			get: function (t, p) {
				if (p in t) return t[p];
				if (typeof p === 'symbol' || p === 'then' || p === 'toJSON') return undefined;
				return function () { return undefined; };
			},
		});
	}
	function listener() { return { remove: function () {} }; }
	class Base {
		constructor() { this.__args = Array.prototype.slice.call(arguments); return absorb(this); }
		addListener() { return listener(); }
	}
	class LatLng {
		constructor(lat, lng) {
			if (lat && typeof lat === 'object') { this._lat = Number(lat.lat); this._lng = Number(lat.lng); }
			else { this._lat = Number(lat); this._lng = Number(lng); }
		}
		lat() { return this._lat; }
		lng() { return this._lng; }
		equals(o) { return !!o && o.lat() === this._lat && o.lng() === this._lng; }
		toJSON() { return { lat: this._lat, lng: this._lng }; }
		toString() { return '(' + this._lat + ', ' + this._lng + ')'; }
	}
	class LatLngBounds extends Base {
		extend() { return this; }
		getCenter() { return new LatLng(0, 0); }
	}
	class Map extends Base {
		getCenter() { return new LatLng(0, 0); }
		getZoom() { return 14; }
		getBounds() { return new LatLngBounds(); }
		getMapTypeId() { return 'roadmap'; }
	}
	class Geocoder extends Base {
		geocode(request, callback) {
			if (callback) setTimeout(function () { callback([], 'ZERO_RESULTS'); });
			return Promise.resolve({ results: [] });
		}
	}
	class Autocomplete extends Base {
		getPlace() { return {}; }
	}
	class DirectionsService extends Base {
		route(request, callback) {
			if (callback) setTimeout(function () { callback(null, 'ZERO_RESULTS'); });
			return Promise.resolve({ routes: [] });
		}
	}
	const maps = {
		Map: Map,
		LatLng: LatLng,
		LatLngBounds: LatLngBounds,
		Marker: class Marker extends Base {},
		InfoWindow: class InfoWindow extends Base {},
		DirectionsRenderer: class DirectionsRenderer extends Base {},
		DirectionsService: DirectionsService,
		Geocoder: Geocoder,
		places: { Autocomplete: Autocomplete },
		event: {
			addListener: listener,
			addListenerOnce: listener,
			addDomListener: listener,
			removeListener: function () {},
			clearInstanceListeners: function () {},
			trigger: function () {},
		},
		MapTypeId: { ROADMAP: 'roadmap', SATELLITE: 'satellite', HYBRID: 'hybrid', TERRAIN: 'terrain' },
		GeocoderStatus: { OK: 'OK', ZERO_RESULTS: 'ZERO_RESULTS' },
		DirectionsStatus: { OK: 'OK', ZERO_RESULTS: 'ZERO_RESULTS' },
		TravelMode: { DRIVING: 'DRIVING' },
		ControlPosition: {},
	};
	maps.importLibrary = function () { return Promise.resolve(maps); };
	window.google = { maps: maps };
	var callback = '__CALLBACK__';
	if (callback && typeof window[callback] === 'function') window[callback]();
})();
`;

/** Serves the offline Google Maps stub instead of maps.googleapis.com. */
export async function stubGoogleMaps(page: Page): Promise<void> {
	await page.route('https://maps.googleapis.com/**', (route) => {
		const url = new URL(route.request().url());
		if (!url.pathname.startsWith('/maps/api/js')) {
			return route.fulfill({ status: 204, body: '' });
		}
		const callback = (url.searchParams.get('callback') || '').replace(/[^\w$]/g, '');
		return route.fulfill({
			status: 200,
			contentType: 'text/javascript',
			body: GOOGLE_MAPS_STUB.replace('__CALLBACK__', callback),
		});
	});
}

/** Uncaught errors of the page (console errors about the missing API are not counted). */
export function collectPageErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	return errors;
}

async function reachable(url: string, init?: RequestInit): Promise<boolean> {
	try {
		await fetch(url, { ...init, signal: AbortSignal.timeout(3000) });
		return true;
	} catch {
		return false;
	}
}

let apiUp: Promise<boolean> | undefined;

/** True when the GraphQL API and the socket.io services both answer. */
export function apiIsUp(): Promise<boolean> {
	apiUp ??= (async () =>
		(await reachable(GQL_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ query: '{ __typename }' }),
		})) && (await reachable(SERVICES_URL)))();
	return apiUp;
}

export const API_REQUIRED =
	'needs the upgraded API (GraphQL on 8443, services on 5500); the lead starts it for e2e runs';

async function adminToken(): Promise<string> {
	const res = await gql<{ adminLogin: { token: string } }>(
		`mutation Login($email: String!, $password: String!) {
			adminLogin(email: $email, password: $password) { token }
		}`,
		ADMIN
	);
	if (!res.data?.adminLogin?.token) {
		throw new Error(`admin login failed: ${JSON.stringify(res.errors)}`);
	}
	return res.data.adminLogin.token;
}

function must<T>(res: { data?: T; errors?: { message: string }[] }, what: string): T {
	if (!res.data || res.errors?.length) {
		throw new Error(`${what} failed: ${JSON.stringify(res.errors)}`);
	}
	return res.data;
}

/** A 1x1 transparent PNG, so the product card needs no network for its image. */
const PIXEL =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export interface SeededProduct {
	token: string;
	warehouseId: string;
	warehouseName: string;
	productId: string;
	warehouseProductId: string;
	title: string;
	price: number;
}

/**
 * Registers a store at the default location with one product for delivery (and takeaway).
 * `title` is unique per run, so a search finds exactly this product.
 */
export async function seedStoreWithProduct(): Promise<SeededProduct> {
	const token = await adminToken();
	const run = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
	const title = `E2E Shop Pizza ${run}`;
	const warehouseName = `E2E Shop Store ${run}`;
	const price = 10;

	const warehouse = must(
		await gql<{ registerWarehouse: { id: string } }>(
			`mutation Register($registerInput: WarehouseRegisterInput!) {
				registerWarehouse(registerInput: $registerInput) { id }
			}`,
			{
				registerInput: {
					password: `e2e-${run}`,
					warehouse: {
						name: warehouseName,
						username: `e2e-shop-web-${run}`,
						logo: PIXEL,
						isActive: true,
						isPaymentEnabled: false,
						isManufacturing: false,
						isCarrierRequired: false,
						hasRestrictedCarriers: false,
						inStoreMode: false,
						carrierCompetition: false,
						contactEmail: `e2e-shop-web-${run}@example.com`,
						contactPhone: '0888000000',
						geoLocation: {
							countryId: COUNTRY_BG,
							city: 'Sofia',
							streetAddress: 'Vitosha',
							house: '1',
							loc: {
								type: 'Point',
								coordinates: [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat],
							},
						},
					},
				},
			},
			token
		),
		'registerWarehouse'
	).registerWarehouse;

	const product = must(
		await gql<{ createProduct: { id: string } }>(
			`mutation CreateProduct($product: ProductCreateInput!) {
				createProduct(product: $product) { id }
			}`,
			{
				product: {
					title: [{ locale: 'en-US', value: title }],
					description: [{ locale: 'en-US', value: 'Baked by the e2e suite' }],
					details: [{ locale: 'en-US', value: 'Tomato, cheese' }],
					images: [{ locale: 'en-US', url: PIXEL, width: 1, height: 1, orientation: 2 }],
				},
			},
			token
		),
		'createProduct'
	).createProduct;

	const added = must(
		await gql<{ addWarehouseProducts: { id: string }[] }>(
			`mutation Add($warehouseId: String!, $products: [WarehouseProductInput!]!) {
				addWarehouseProducts(warehouseId: $warehouseId, products: $products) { id }
			}`,
			{
				warehouseId: warehouse.id,
				products: [
					{
						product: product.id,
						price,
						initialPrice: 12,
						count: 1000,
						isManufacturing: false,
						isCarrierRequired: false,
						isDeliveryRequired: true,
						isTakeaway: true,
						isProductAvailable: true,
						deliveryTimeMin: 20,
						deliveryTimeMax: 40,
					},
				],
			},
			token
		),
		'addWarehouseProducts'
	).addWarehouseProducts;

	return {
		token,
		warehouseId: warehouse.id,
		warehouseName,
		productId: product.id,
		warehouseProductId: added[0].id,
		title,
		price,
	};
}

/** Registers a customer at the default location through GraphQL; returns the user id. */
export async function registerCustomer(): Promise<string> {
	const res = await gql<{ registerUser: { id: string } }>(
		`mutation Register($registerInput: UserRegisterInput!) {
			registerUser(registerInput: $registerInput) { id }
		}`,
		{
			registerInput: {
				user: {
					apartment: '0',
					geoLocation: {
						countryId: COUNTRY_BG,
						city: 'Sofia',
						streetAddress: 'Vitosha',
						house: '1',
						loc: {
							type: 'Point',
							coordinates: [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat],
						},
					},
				},
			},
		}
	);
	return must(res, 'registerUser').registerUser.id;
}

/** Removes the store and the product of `seedStoreWithProduct` (orders stay, as history). */
export async function removeSeed(seed: SeededProduct | undefined): Promise<void> {
	if (!seed) {
		return;
	}
	await gql(
		`mutation RemoveStore($ids: [String!]!) { removeWarehousesByIds(ids: $ids) }`,
		{ ids: [seed.warehouseId] },
		seed.token
	);
	await gql(
		`mutation RemoveProduct($ids: [String!]!) { removeProductsByIds(ids: $ids) { n } }`,
		{ ids: [seed.productId] },
		seed.token
	);
}

/** Opens the shop like a new visitor: offline maps, and nothing stored from an earlier visit. */
export async function openShop(page: Page, path = '/'): Promise<void> {
	await stubGoogleMaps(page);
	// Browser errors go to the test output, to explain a failure (unhandled rejections
	// of the shop's socket.io calls end up here)
	page.on('console', (message) => {
		if (message.type() === 'error' && !/ERR_CONNECTION_REFUSED/.test(message.text())) {
			console.log(`[browser] ${message.text()}`);
		}
	});
	await page.goto(path);
}
