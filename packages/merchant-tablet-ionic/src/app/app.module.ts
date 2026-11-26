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
import {
	IonApp,
	IonicRouteStrategy,
	IonRouterOutlet,
	provideIonicAngular,
} from '@ionic/angular';
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
		IonApp,
		IonRouterOutlet,
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
		// Ionic's default config, as before (the app never customised it). The page
		// modules whose components open modals provide their own ModalController, as the
		// NgModule build did per module, so a modal resolves its page module's services.
		provideIonicAngular(),
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
