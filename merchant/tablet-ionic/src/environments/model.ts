export interface Environment {
	production: boolean;

	SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;

	APP_VERSION: string;

	API_FILE_UPLOAD_URL: string;

	DEFAULT_LOGIN_USERNAME: string;
	DEFAULT_LOGIN_PASSWORD: string;

	LOGIN_LOGO: string;
	NO_INTERNET_LOGO: string;

	COMPANY_NAME: string;
	APP_NAME: string;

	GOOGLE_MAPS_API_KEY: string;

	GOOGLE_ANALYTICS_API_KEY: string;
	FAKE_UUID: string;
	MIXPANEL_API_KEY: string;

	MAP_MERCHANT_ICON_LINK: string;

	MAP_USER_ICON_LINK: string;

	MAP_CARRIER_ICON_LINK: string;

	DEFAULT_LANGUAGE: string;

	// For maintenance micro service
	SETTINGS_APP_TYPE: string;
	SETTINGS_MAINTENANCE_API_URL: string;
}
