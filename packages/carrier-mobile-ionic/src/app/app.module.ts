import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonApp } from '@ionic/angular/ion-app';
import { IonRouterOutlet } from '@ionic/angular/ion-router-outlet';
import { IonicRouteStrategy } from '@ionic/angular/ionic-route-strategy';
import { provideIonicAngular } from '@ionic/angular/provide';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonModule } from '@modules/client.common.angular2/common.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { GoogleMapsLoader } from '@modules/client.common.angular2/services/googleMapsLoader';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { appTenantConfig, GraphQLModule } from '../graphql/apollo.config';
import { environment } from '../environments/environment';
import { CarriersOrdersService } from '../services/carriers-orders.service';
import { Store } from '../services/store.service';
import { MenuModule } from '../components/menu/menu.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		GraphQLModule,
		MenuModule,
		TranslateModule.forRoot({
			loader: provideTranslateHttpLoader({
				prefix: './assets/i18n/',
				suffix: '.json',
			}),
		}),
		CommonModule.forRoot({
			apiUrl: environment.SERVICES_ENDPOINT,
			// socket handshakes name the tenant and the carrier's login token
			// (DESIGN.md §3.3); the login page re-handshakes after login
			tenant: appTenantConfig(),
			tokenStorageKey: 'token',
		}),
		PipesModule,
		IonApp,
		IonRouterOutlet,
	],
	bootstrap: [AppComponent],
	providers: [
		// Ionic's default config, as before (the app never customised it).
		provideIonicAngular(),
		ServerConnectionService,
		GoogleMapsLoader,
		MaintenanceService,
		CarriersOrdersService,
		Store,
		provideAppInitializer(serverConnectionInitializer),
		provideAppInitializer(googleMapsInitializer),
		provideAppInitializer(maintenanceInitializer),
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
	],
})
export class AppModule {}

export function serverConnectionInitializer() {
	return inject(ServerConnectionService).load(
		environment.SERVICES_ENDPOINT,
		inject(Store)
	);
}

/**
 * Loads the Google Maps JavaScript API, as before (without a key Google serves it in its
 * "development purposes only" mode). It no longer blocks the app forever: when the script
 * cannot load (offline), the app boots after MAPS_LOAD_TIMEOUT_MS without maps.
 */
export const MAPS_LOAD_TIMEOUT_MS = 10_000;

export function googleMapsInitializer() {
	const loader = inject(GoogleMapsLoader);
	if (!environment.GOOGLE_MAPS_API_KEY) {
		console.warn('GOOGLE_MAPS_API_KEY is empty: Google Maps runs without a key.');
	}
	return Promise.race([
		loader.load(environment.GOOGLE_MAPS_API_KEY),
		new Promise((resolve) => setTimeout(resolve, MAPS_LOAD_TIMEOUT_MS)),
	]);
}

export function maintenanceInitializer() {
	return inject(MaintenanceService).load(
		environment.SETTINGS_APP_TYPE,
		environment.SETTINGS_MAINTENANCE_API_URL
	);
}
