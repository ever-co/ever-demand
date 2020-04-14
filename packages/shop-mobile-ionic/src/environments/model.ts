export interface Environment {
	production: boolean;

	VERSION: string;

	// 'slides' | 'list'
	PRODUCTS_VIEW_TYPE: string;

	// 'popup' or 'page'
	ORDER_INFO_TYPE: string;

	API_FILE_UPLOAD_URL: string;

	INVITE_BY_CODE_LOGO: string;
	NO_INTERNET_LOGO: string;

	COMPANY_NAME: string;

	GOOGLE_MAPS_API_KEY: string;

	GOOGLE_ANALYTICS_API_KEY: string;

	FAKE_UUID: string;

	// Not secret MixPanel Token
	MIXPANEL_API_KEY: string;

	DEFAULT_LANGUAGE: string;
	DEFAULT_LOCALE: string;

	DELIVERY_TIME_MIN: number;
	DELIVERY_TIME_MAX: number;

	SUPPORT_NUMBER: string;

	STRIPE_PUBLISHABLE_KEY: string;

	STRIPE_POP_UP_LOGO: string;

	MAP_MERCHANT_ICON_LINK: string;

	MAP_USER_ICON_LINK: string;

	MAP_CARRIER_ICON_LINK: string;

	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;

	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;

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

	// For maintenance micro service
	SETTINGS_APP_TYPE: string;
	SETTINGS_MAINTENANCE_API_URL: string;

	// For "single" merchant (multiple branches)
	MERCHANT_IDS: string[];
}
