import {
	inject,
	isDevMode,
	NgModule,
	provideAppInitializer,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouteReuseStrategy } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular/lazy';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { CommonModule } from '@modules/client.common.angular2/common.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { GoogleMapsLoader } from '@modules/client.common.angular2/services/googleMapsLoader';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { FileUploadModule } from 'ng2-file-upload';
import { MenuModule } from '../components/menu/menu.module';
import { environment } from '../environments/environment';
import { GraphQLModule } from '../graphql/apollo.config';
import { Store } from '../services/store.service';
import { UserMutationModule } from '../@shared/user/mutation/user-mutation.module';
import { PagesModuleGuard } from '../pages/pages.module.guard';
import { MaintenanceModuleGuard } from './+maintenance-info/maintenance-info.module.guard';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		MenuModule,
		IonicModule.forRoot(),
		GraphQLModule,
		TranslateModule.forRoot({
			loader: provideTranslateHttpLoader({
				prefix: './assets/i18n/',
				suffix: '.json',
			}),
		}),
		CommonModule.forRoot({
			apiUrl: environment.SERVICES_ENDPOINT,
		}),
		FileUploadModule,
		UserMutationModule,
	],
	providers: [
		// ngx-masonry (the product grid) still animates through @angular/animations
		provideAnimationsAsync(),
		GoogleMapsLoader,
		ServerConnectionService,
		MaintenanceService,
		provideAppInitializer(googleMapsInitializer),
		provideAppInitializer(serverConnectionInitializer),
		provideAppInitializer(maintenanceInitializer),
		provideServiceWorker('ngsw-worker.js', {
			enabled: environment.production && !isDevMode(),
			registrationStrategy: 'registerWhenStable:30000',
		}),
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		PagesModuleGuard,
		MaintenanceModuleGuard,
		Store,
	],
	bootstrap: [AppComponent],
})
export class AppModule {}

/**
 * Loads the Google Maps JavaScript API (maps, geocoder and places autocomplete). Without an
 * API key the app boots without maps instead of waiting for a script that cannot work.
 */
export function googleMapsInitializer() {
	const loader = inject(GoogleMapsLoader);
	if (!environment.GOOGLE_MAPS_API_KEY) {
		console.warn('GOOGLE_MAPS_API_KEY is empty: maps and address search are disabled.');
		return Promise.resolve();
	}
	return loader.load(environment.GOOGLE_MAPS_API_KEY);
}

export function serverConnectionInitializer() {
	return inject(ServerConnectionService).load(
		environment.SERVICES_ENDPOINT,
		inject(Store)
	);
}

export function maintenanceInitializer() {
	return inject(MaintenanceService).load(
		environment.SETTINGS_APP_TYPE,
		environment.SETTINGS_MAINTENANCE_API_URL
	);
}
