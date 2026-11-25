/**
 * Runtime settings of the shop app, the Expo version of the Ionic app's `environment.ts`.
 *
 * Every value comes from an `EXPO_PUBLIC_*` env var. Expo inlines those at bundle time, which only
 * works for literal `process.env.EXPO_PUBLIC_NAME` reads, so each one is spelled out below. All of
 * them ship to the client: never put a secret here.
 */

export type ProductsViewType = 'slides' | 'list';
export type OrderInfoType = 'page' | 'popup';

export interface FakeInvite {
	ID: string;
	CITY: string;
	POSTCODE: string;
	ADDRESS: string;
	HOUSE: string;
	CREATED_AT: string;
	UPDATED_AT: string;
	APARTMENT: string;
	CODE: number;
	COUNTRY_ID: number;
}

export interface Environment {
	PRODUCTION: boolean;
	VERSION: string;
	PRODUCTS_VIEW_TYPE: ProductsViewType;
	ORDER_INFO_TYPE: OrderInfoType;
	INVITE_BY_CODE_LOGO: string;
	NO_INTERNET_LOGO: string;
	COMPANY_NAME: string;
	FAKE_UUID: string;
	DEFAULT_LANGUAGE: string;
	DEFAULT_LOCALE: string;
	DELIVERY_TIME_MIN: number;
	DELIVERY_TIME_MAX: number;
	SUPPORT_NUMBER: string;
	STRIPE_PUBLISHABLE_KEY: string;
	DEFAULT_LATITUDE: number | null;
	DEFAULT_LONGITUDE: number | null;
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	SERVICES_ENDPOINT: string;
	FAKE_INVITE: FakeInvite | null;
	SETTINGS_APP_TYPE: string;
	SETTINGS_MAINTENANCE_API_URL: string;
	MERCHANT_IDS: string[];
	SHOPPING_CART: boolean;
}

const str = (value: string | undefined, fallback: string): string =>
	value === undefined || value === '' ? fallback : value;

const num = (value: string | undefined, fallback: number): number => {
	const parsed = Number(value);
	return value === undefined || value === '' || Number.isNaN(parsed) ? fallback : parsed;
};

const optionalNum = (value: string | undefined, fallback: number | null): number | null => {
	if (value === undefined) {
		return fallback;
	}
	if (value === '') {
		return null;
	}
	const parsed = Number(value);
	return Number.isNaN(parsed) ? fallback : parsed;
};

const bool = (value: string | undefined, fallback: boolean): boolean =>
	value === undefined || value === '' ? fallback : /^(1|true|yes|on)$/i.test(value);

const list = (value: string | undefined): string[] =>
	(value || '')
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean);

function fakeInvite(): FakeInvite | null {
	const code = num(process.env.EXPO_PUBLIC_FAKE_INVITE_CODE, 8321);

	if (process.env.EXPO_PUBLIC_FAKE_INVITE_CODE === 'off') {
		return null;
	}

	return {
		ID: str(process.env.EXPO_PUBLIC_FAKE_INVITE_ID, '1ae9d04f9010d834f8906881'),
		CITY: str(process.env.EXPO_PUBLIC_FAKE_INVITE_CITY, 'Sofia'),
		POSTCODE: str(process.env.EXPO_PUBLIC_FAKE_INVITE_POSTCODE, '1700'),
		ADDRESS: str(process.env.EXPO_PUBLIC_FAKE_INVITE_ADDRESS, 'Simeonovsko shose'),
		HOUSE: str(process.env.EXPO_PUBLIC_FAKE_INVITE_HOUSE, '104'),
		CREATED_AT: str(process.env.EXPO_PUBLIC_FAKE_INVITE_CREATED_AT, '2018-05-02T14:50:55.658Z'),
		UPDATED_AT: str(process.env.EXPO_PUBLIC_FAKE_INVITE_UPDATED_AT, '2018-05-02T14:50:55.658Z'),
		APARTMENT: str(process.env.EXPO_PUBLIC_FAKE_INVITE_APARTMENT, '3'),
		CODE: code,
		COUNTRY_ID: num(process.env.EXPO_PUBLIC_FAKE_INVITE_COUNTRY_ID, 21),
	};
}

export function loadEnvironment(): Environment {
	return {
		PRODUCTION: bool(process.env.EXPO_PUBLIC_PRODUCTION, false),
		VERSION: str(process.env.EXPO_PUBLIC_VERSION, '0.6.0'),
		PRODUCTS_VIEW_TYPE:
			process.env.EXPO_PUBLIC_PRODUCTS_VIEW_TYPE === 'list' ? 'list' : 'slides',
		ORDER_INFO_TYPE: process.env.EXPO_PUBLIC_ORDER_INFO_TYPE === 'popup' ? 'popup' : 'page',
		INVITE_BY_CODE_LOGO: str(process.env.EXPO_PUBLIC_INVITE_BY_CODE_LOGO, ''),
		NO_INTERNET_LOGO: str(process.env.EXPO_PUBLIC_NO_INTERNET_LOGO, ''),
		COMPANY_NAME: str(process.env.EXPO_PUBLIC_COMPANY_NAME, 'Ever Co. LTD'),
		FAKE_UUID: str(process.env.EXPO_PUBLIC_FAKE_UUID, ''),
		DEFAULT_LANGUAGE: str(process.env.EXPO_PUBLIC_DEFAULT_LANGUAGE, 'en-US'),
		DEFAULT_LOCALE: str(process.env.EXPO_PUBLIC_DEFAULT_LOCALE, 'en-US'),
		DELIVERY_TIME_MIN: num(process.env.EXPO_PUBLIC_DELIVERY_TIME_MIN, 30),
		DELIVERY_TIME_MAX: num(process.env.EXPO_PUBLIC_DELIVERY_TIME_MAX, 60),
		SUPPORT_NUMBER:
			process.env.EXPO_PUBLIC_SUPPORT_NUMBER === undefined
				? '0888888888'
				: process.env.EXPO_PUBLIC_SUPPORT_NUMBER,
		STRIPE_PUBLISHABLE_KEY: str(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY, ''),
		DEFAULT_LATITUDE: optionalNum(process.env.EXPO_PUBLIC_DEFAULT_LATITUDE, 42.6459136),
		DEFAULT_LONGITUDE: optionalNum(process.env.EXPO_PUBLIC_DEFAULT_LONGITUDE, 23.3332736),
		GQL_ENDPOINT: str(process.env.EXPO_PUBLIC_GQL_ENDPOINT, 'http://localhost:8443/graphql'),
		GQL_SUBSCRIPTIONS_ENDPOINT: str(
			process.env.EXPO_PUBLIC_GQL_SUBSCRIPTIONS_ENDPOINT,
			'ws://localhost:2086/subscriptions',
		),
		SERVICES_ENDPOINT: str(process.env.EXPO_PUBLIC_SERVICES_ENDPOINT, 'http://localhost:5500'),
		FAKE_INVITE: fakeInvite(),
		SETTINGS_APP_TYPE: str(process.env.EXPO_PUBLIC_SETTINGS_APP_TYPE, 'shop-mobile'),
		SETTINGS_MAINTENANCE_API_URL: str(process.env.EXPO_PUBLIC_SETTINGS_MAINTENANCE_API_URL, ''),
		MERCHANT_IDS: list(process.env.EXPO_PUBLIC_MERCHANT_IDS),
		SHOPPING_CART: bool(process.env.EXPO_PUBLIC_SHOPPING_CART, false),
	};
}

/** The settings of this bundle. Tests override single values with `overrideEnv`. */
export const env: Environment = loadEnvironment();

/** Test helper: change settings in place (the object is shared by every module). */
export function overrideEnv(values: Partial<Environment>): () => void {
	const previous = { ...env };
	Object.assign(env, values);
	return () => {
		Object.assign(env, previous);
	};
}
