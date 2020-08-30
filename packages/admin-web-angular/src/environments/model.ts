export interface Environment {
	production: boolean;

	SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;

	GOOGLE_MAPS_API_KEY: string;

	DEFAULT_LATITUDE: number;
	DEFAULT_LONGITUDE: number;

	NO_INTERNET_LOGO: string;

	MAP_MERCHANT_ICON_LINK: string;

	MAP_USER_ICON_LINK: string;

	MAP_CARRIER_ICON_LINK: string;

	API_FILE_UPLOAD_URL: string;

	COMPANY_NAME: string;
	COMPANY_SITE_LINK: string;
	COMPANY_GITHUB_LINK: string;
	COMPANY_FACEBOOK_LINK: string;
	COMPANY_TWITTER_LINK: string;
	COMPANY_LINKEDIN_LINK: string;

	GENERATE_PASSWORD_CHARSET: string;

	CURRENCY_SYMBOL: string;

	DEFAULT_LANGUAGE: string;
	// For maintenance micro service
	SETTINGS_APP_TYPE?: string;
	SETTINGS_MAINTENANCE_API_URL?: string;
}
