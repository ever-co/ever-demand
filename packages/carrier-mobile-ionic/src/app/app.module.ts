import { NgModule, NO_ERRORS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { GoogleMaps } from '@ionic-native/google-maps';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { Mixpanel } from '@ionic-native/mixpanel/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Globalization } from '@ionic-native/globalization/ngx';
import { Device } from '@ionic-native/device/ngx';
import { CommonModule } from '@modules/client.common.angular2/common.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { GraphQLModule } from '../graphql/apollo.config';
import { environment } from '../environments/environment';
import { GoogleMapsLoader } from '@modules/client.common.angular2/services/googleMapsLoader';
import { CarriersOrdersService } from '../services/carriers-orders.service';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { Vibration } from '@ionic-native/vibration/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { Store } from '../services/store.service';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { RouteReuseStrategy } from '@angular/router';
import { AppComponent } from './app.component';
import { MenuModule } from 'components/menu/menu.module';

@NgModule({
	schemas: [NO_ERRORS_SCHEMA],
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		GraphQLModule,
		MenuModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		IonicModule.forRoot(),
		CommonModule.forRoot({
			apiUrl: environment.SERVICES_ENDPOINT,
		}),
		HttpClientModule,
		PipesModule,
	],
	bootstrap: [AppComponent],
	entryComponents: [AppComponent],
	providers: [
		ServerConnectionService,
		{
			provide: APP_INITIALIZER,
			useFactory: serverConnectionFactory,
			deps: [ServerConnectionService, Store],
			multi: true,
		},
		GoogleMapsLoader,
		{
			provide: APP_INITIALIZER,
			useFactory: googleMapsLoaderFactory,
			deps: [GoogleMapsLoader],
			multi: true,
		},
		MaintenanceService,
		{
			provide: APP_INITIALIZER,
			useFactory: maintenanceFactory,
			deps: [MaintenanceService],
			multi: true,
		},
		StatusBar,
		SplashScreen,
		GoogleMaps,
		// { provide: ErrorHandler, useClass: IonicErrorHandler },
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		GoogleAnalytics,
		Mixpanel,
		Network,
		Globalization,
		Device,
		CarriersOrdersService,
		Vibration,
		LocalNotifications,
		Store,
	],
})
export class AppModule {
	constructor() {}
}

// @ngx-translation needs this function
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function googleMapsLoaderFactory(provider: GoogleMapsLoader) {
	return () => provider.load(environment.GOOGLE_MAPS_API_KEY);
}

export function maintenanceFactory(provider: MaintenanceService) {
	return () =>
		provider.load(
			environment['SETTINGS_APP_TYPE'],
			environment['SETTINGS_MAINTENANCE_API_URL']
		);
}

export function serverConnectionFactory(
	provider: ServerConnectionService,
	store: Store
) {
	return () => provider.load(environment.SERVICES_ENDPOINT, store);
}
