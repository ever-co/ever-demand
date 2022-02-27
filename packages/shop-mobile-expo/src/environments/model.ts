import type { supportedLangType } from '../store/features/translation/types';

export default interface Environment {
	// TODO: Add more descriptive comments.
	/** App environment */
	PRODUCTION: boolean;

	/** App version */
	VERSION: string;

	/** Default state of products view type' */
	PRODUCTS_VIEW_TYPE: 'slides' | 'list';

	/** Default state of order info state */
	ORDER_INFO_TYPE: 'popup' | 'page';

	COMPANY_NAME: string;

	/** Url of images */
	IMAGE_URL: {
		INVITE_BY_CODE_LOGO: string;
		NO_INTERNET_LOGO: string;
		MAP_MERCHANT_ICON: string;
		MAP_USER_ICON: string;
		MAP_CARRIER_ICON: string;
	};

	GOOGLE: {
		MAPS_API_KEY: string;
		ANALYTICS_API_KEY: string;
	};

	FAKE_UUID: string;

	/**
	 *  Not secret MixPanel Token
	 */
	MIXPANEL_API_KEY: string;

	LANGUAGE: {
		LANG: supportedLangType;
		LOCALE: supportedLangType;
	};

	DELIVERY_TIME: {
		MIN: number;
		MAX: number;
	};

	SUPPORT_NUMBER: string;

	STRIP: {
		PUBLISHABLE_KEY: string;
		POP_UP_LOGO: string;
	};

	COORDINATE: {
		LATITUDE: number;
		LONGITUDE: number;
	};

	ENDPOINT: {
		GQL: string;
		GQL_SUBSCRIPTIONS: string;
		SERVICES: string;
		HTTPS_SERVICES: string;
		API_FILE_UPLOAD: string;
	};

	FAKE_INVITE: {
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
	};

	/** For maintenance micro service */
	SETTINGS: {
		APP_TYPE: string;
		MAINTENANCE_API_URL: string;
	};

	/** For "single" merchant (multiple branches) */
	MERCHANT_IDS: string[];

	SHOPPING_CART: boolean;
}
