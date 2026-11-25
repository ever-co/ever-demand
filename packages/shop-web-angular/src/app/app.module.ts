import {
	inject,
	NgModule,
	provideAppInitializer,
	provideZoneChangeDetection,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { PreloadAllModules, RouterModule } from '@angular/router';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideApollo } from 'apollo-angular';
import { environment } from 'environments/environment';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CommonModule } from '@modules/client.common.angular2/common.module';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { GoogleMapsLoader } from '@modules/client.common.angular2/services/googleMapsLoader';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { IconsModule } from '../modules/icons';
import {
	MatBoldInputModule,
	MatSearchModule,
} from '../modules/material-extensions';
import { ROUTES } from './app.routes';
import { AppComponent } from './app.component';
import { AppState } from './app.service';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { NoContentComponent } from './no-content';
import { SidenavService } from './sidenav/sidenav.service';
import { SidenavContentComponent } from './sidenav/sidenav-content.component';
import { ServerSettings } from './services/server-settings';
import { LoginModuleGuard } from './+login/login.module.guard';
import { ProductsModuleGuard } from './+products/products.module.guard';
import { AppModuleGuard } from './app.module.guard';
import { MaintenanceModuleGuard } from './+maintenance-info/maintenance-info.module.guard';
import { Store } from './services/store';
import { GeoLocationService } from './services/geo-location';
import { LocationPopupModalModule } from './shared/location-popup/location-popup.module';
import { AuthGuard } from './authentication/auth.guard';
import { createApolloOptions } from './apollo-options';

const APP_PROVIDERS = [
	ServerConnectionService,
	ServerSettings,
	provideAppInitializer(() => {
		const serverConnection = inject(ServerConnectionService);
		const serverSettings = inject(ServerSettings);
		const store = inject(Store);

		// The settings (invites, registration) are read only once the connection check has
		// stored its result; in parallel, the first visit always skipped them.
		return serverConnection
			.load(environment.SERVICES_ENDPOINT, store)
			.then(() => serverSettings.load());
	}),
	MaintenanceService,
	provideAppInitializer(() =>
		inject(MaintenanceService).load(
			environment['SETTINGS_APP_TYPE'],
			environment['SETTINGS_MAINTENANCE_API_URL']
		)
	),
	GoogleMapsLoader,
	provideAppInitializer(() =>
		inject(GoogleMapsLoader).load(environment.GOOGLE_MAPS_API_KEY)
	),
	AppState,
	SidenavService,
];

@NgModule({
	bootstrap: [AppComponent],
	declarations: [
		AppComponent,
		ToolbarComponent,
		NoContentComponent,
		SidenavContentComponent,
	],
	imports: [
		BrowserModule,
		TranslateModule.forRoot({
			loader: provideTranslateHttpLoader({
				prefix: './assets/i18n/',
				suffix: '.json',
			}),
		}),
		FormsModule,
		RouterModule.forRoot(ROUTES, {
			useHash: Boolean(history.pushState) === false,
			preloadingStrategy: PreloadAllModules,
		}),
		MatIconModule,
		MatButtonModule,
		MatSidenavModule,
		MatToolbarModule,
		MatCheckboxModule,
		MatFormFieldModule,
		MatListModule,
		MatCardModule,

		MatBoldInputModule,
		MatSearchModule,
		MatSlideToggleModule,
		MatButtonToggleModule,
		IconsModule,
		CommonModule.forRoot({
			apiUrl: environment.SERVICES_ENDPOINT,
		}),
		LocationPopupModalModule,
	],
	providers: [
		provideZoneChangeDetection(),
		provideHttpClient(withInterceptorsFromDi()),
		provideAnimations(),
		provideApollo(createApolloOptions),
		{
			// The legacy (underline only) form field look the shop was designed with.
			provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
			useValue: { appearance: 'fill', subscriptSizing: 'dynamic' },
		},
		environment.ENV_PROVIDERS,
		APP_PROVIDERS,
		LoginModuleGuard,
		ProductsModuleGuard,
		AppModuleGuard,
		MaintenanceModuleGuard,
		GeoLocationService,
		AuthGuard,
	],
})
export class AppModule {}
