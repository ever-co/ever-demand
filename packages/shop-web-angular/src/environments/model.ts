import { NgModuleRef } from '@angular/core';

export interface Environment {
	production: boolean;
	ENV_PROVIDERS: any;
	SERVICES_ENDPOINT: string;
	HTTPS_SERVICES_ENDPOINT: string;
	GQL_ENDPOINT: string;
	GQL_SUBSCRIPTIONS_ENDPOINT: string;
	AUTH_LOGO: string;
	SETTINGS_APP_TYPE?: string;
	SETTINGS_MAINTENANCE_API_URL?: string;
	GOOGLE_MAPS_API_KEY: string;
	DEFAULT_LATITUDE?: number;
	DEFAULT_LONGITUDE?: number;
	DEFAULT_LANGUAGE: string;
	DELIVERY_TIME_MIN?: number;
	DELIVERY_TIME_MAX?: number;
	NO_INTERNET_LOGO: string;

	decorateModuleRef(modRef: NgModuleRef<any>): NgModuleRef<any>;
}
