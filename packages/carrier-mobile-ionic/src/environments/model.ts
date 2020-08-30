export interface Environment {
	production: boolean;

	APP_VERSION: string;

	DEFAULT_CUSTOMER_LOGO: string;
	LOGIN_LOGO: string;
	NO_INTERNET_LOGO: string;

	COMPANY_NAME: string;
	APP_NAME: string;

	GOOGLE_MAPS_API_KEY: string;

	GOOGLE_ANALYTICS_API_KEY: string;
	FAKE_UUID: string;

	// Not secret MixPanel Token
	MIXPANEL_API_KEY: string;

	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;

	DEFAULT_LOGIN_USERNAME: string;
	DEFAULT_LOGIN_PASSWORD: string;

	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;

	DEFAULT_LANGUAGE: string;

	// For maintenance micro service
	SETTINGS_APP_TYPE: string;
	SETTINGS_MAINTENANCE_API_URL: string;
}
