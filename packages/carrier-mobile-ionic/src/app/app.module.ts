import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular/lazy';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonModule } from '@modules/client.common.angular2/common.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { GoogleMapsLoader } from '@modules/client.common.angular2/services/googleMapsLoader';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { GraphQLModule } from '../graphql/apollo.config';
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
		IonicModule.forRoot(),
		CommonModule.forRoot({
			apiUrl: environment.SERVICES_ENDPOINT,
		}),
		PipesModule,
	],
	bootstrap: [AppComponent],
	providers: [
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
 * Loads the Google Maps JavaScript API used by the carrier map. Without an API key the
 * app boots without a map instead of waiting for a script that cannot work.
 */
export function googleMapsInitializer() {
	const loader = inject(GoogleMapsLoader);
	if (!environment.GOOGLE_MAPS_API_KEY) {
		console.warn('GOOGLE_MAPS_API_KEY is empty: the map is disabled.');
		return Promise.resolve();
	}
	return loader.load(environment.GOOGLE_MAPS_API_KEY);
}

export function maintenanceInitializer() {
	return inject(MaintenanceService).load(
		environment.SETTINGS_APP_TYPE,
		environment.SETTINGS_MAINTENANCE_API_URL
	);
}
