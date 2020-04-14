import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { PreloadAllModules, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'environments/environment';
import { IconsModule } from '../modules/icons';
import {
	MatBoldInputModule,
	MatSearchModule,
} from '../modules/material-extensions';
import { ROUTES } from './app.routes';
import { AppComponent } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState } from './app.service';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { NoContentComponent } from './no-content';
import { CommonModule } from '@modules/client.common.angular2/common.module';
// import { Logger } from 'angular2-logger/core';
import { SidenavService } from './sidenav/sidenav.service';
import { SidenavContentComponent } from './sidenav/sidenav-content.component';
import '../styles/styles.scss';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ServerSettings } from './services/server-settings';
import { LoginModuleGuard } from './+login/login.module.guard';
import { ProductsModuleGuard } from './+products/products.module.guard';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { AppModuleGuard } from './app.module.guard';
import { MaintenanceModuleGuard } from './+maintenance-info/maintenance-info.module.guard';
import { GoogleMapsLoader } from '@modules/client.common.angular2/services/googleMapsLoader';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { Store } from './services/store';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { GeoLocationService } from './services/geo-location';
import { LocationPopupModalModule } from './shared/location-popup/location-popup.module';
import { AuthGuard } from './authentication/auth.guard';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/*
export function serverSettingsFactory(
	serverSettings: ServerSettings,
	serverConnectionService: ServerConnectionService,
	store: Store
) {
	return async () => {
		await serverConnectionService.load(
			environment.SERVICES_ENDPOINT,
			store
		);
		await serverSettings.load();
	};
}
*/

export function serverSettingsFactory(provider: ServerSettings) {
	return () => provider.load();
}

export function maintenanceFactory(provider: MaintenanceService) {
	return () =>
		provider.load(
			environment['SETTINGS_APP_TYPE'],
			environment['SETTINGS_MAINTENANCE_API_URL']
		);
}

export function googleMapsLoaderFactory(provider: GoogleMapsLoader) {
	return () => provider.load(environment.GOOGLE_MAPS_API_KEY);
}

export function serverConnectionFactory(
	provider: ServerConnectionService,
	store: Store
) {
	return () => provider.load(environment.SERVICES_ENDPOINT, store);
}

const APP_PROVIDERS = [
	ServerConnectionService,
	{
		provide: APP_INITIALIZER,
		useFactory: serverConnectionFactory,
		deps: [ServerConnectionService, Store],
		multi: true,
	},
	MaintenanceService,
	{
		provide: APP_INITIALIZER,
		useFactory: maintenanceFactory,
		deps: [MaintenanceService],
		multi: true,
	},
	GoogleMapsLoader,
	{
		provide: APP_INITIALIZER,
		useFactory: googleMapsLoaderFactory,
		deps: [GoogleMapsLoader],
		multi: true,
	},
	...APP_RESOLVER_PROVIDERS,
	AppState,
	SidenavService,
	// Logger,
	ServerSettings,
	InfiniteScrollModule,
	{
		provide: APP_INITIALIZER,
		useFactory: serverSettingsFactory,
		deps: [ServerSettings],
		multi: true,
	},
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
		HttpClientModule,
		ApolloModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		BrowserAnimationsModule,
		FormsModule,
		HttpLinkModule,
		RouterModule.forRoot(ROUTES, {
			useHash: Boolean(history.pushState) === false,
			// enableTracing: true,
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
export class AppModule {
	constructor(apollo: Apollo, httpLink: HttpLink, store: Store) {
		const http = httpLink.create({
			uri: environment.GQL_ENDPOINT,
		});

		const authLink = setContext((_, { headers }) => {
			// get the authentication token from local storage if it exists
			const token = store.token;
			// return the headers to the context so httpLink can read them
			return {
				headers: {
					...headers,
					authorization: token ? `Bearer ${token}` : '',
				},
			};
		});

		apollo.create({
			link: http,
			defaultOptions: {
				watchQuery: {
					fetchPolicy: 'network-only',
					errorPolicy: 'ignore',
				},
				query: {
					fetchPolicy: 'network-only',
					errorPolicy: 'all',
				},
				mutate: {
					errorPolicy: 'all',
				},
			},
			cache: new InMemoryCache(),
		});
	}
}

platformBrowserDynamic().bootstrapModule(AppModule);
