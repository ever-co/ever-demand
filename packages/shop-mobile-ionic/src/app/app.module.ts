import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@modules/client.common.angular2/common.module';
import { MenuModule } from './components/menu/menu.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { Logger } from 'angular2-logger/core';
import { environment } from 'environments/environment';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { Apollo, ApolloModule } from 'apollo-angular';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { setContext } from 'apollo-link-context';
import { ApolloLink } from 'apollo-link';
import { getOperationAST } from 'graphql';
import { Store } from './services/store.service';
import { ServerSettings } from './services/server-settings';
import { GoogleMapsLoader } from '@modules/client.common.angular2/services/googleMapsLoader';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { PagesModuleGuard } from './pages/pages.module.guard';
import { MaintenanceModuleGuard } from './maintenance-info/maintenance-info.module.guard';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Network } from '@ionic-native/network/ngx';
import { Device } from '@ionic-native/device/ngx';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		BrowserAnimationsModule,
		MenuModule,
		ApolloModule,
		HttpLinkModule,
		IonicModule.forRoot(),
		IonicStorageModule.forRoot(),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		CommonModule.forRoot({
			apiUrl: environment.SERVICES_ENDPOINT,
		}),
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production,
		}),
	],
	entryComponents: [AppComponent],
	providers: [
		InAppBrowser,
		SplashScreen,
		StatusBar,
		Network,
		Device,
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
		ServerSettings,
		{
			provide: APP_INITIALIZER,
			useFactory: serverSettingsFactory,
			deps: [ServerSettings],
			multi: true,
		},
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		// Logger,
		PagesModuleGuard,
		MaintenanceModuleGuard,
	],
	bootstrap: [AppComponent],
})
export class AppModule {
	constructor(
		private readonly apollo: Apollo,
		private readonly httpLink: HttpLink,
		private readonly store: Store
	) {
		this._setupApolloAngular();
	}

	private _setupApolloAngular() {
		// Create an http link
		const http = this.httpLink.create({
			uri: environment.GQL_ENDPOINT,
		});

		// Create a WebSocket link
		const ws = new WebSocketLink({
			uri: environment.GQL_SUBSCRIPTIONS_ENDPOINT,
			options: {
				reconnect: true,
				lazy: true,
			},
		});

		const authLink = setContext((_, { headers }) => {
			// get the authentication token from local storage if it exists
			const token = this.store.token;
			// return the headers to the context so httpLink can read them
			return {
				headers: {
					...headers,
					authorization: token ? `Bearer ${token}` : '',
				},
			};
		});

		this.apollo.create({
			link: authLink.concat(
				ApolloLink.split(
					(operation) => {
						const operationAST = getOperationAST(
							operation.query,
							operation.operationName
						);
						return (
							!!operationAST &&
							operationAST.operation === 'subscription'
						);
					},
					ws,
					http
				)
			),
			defaultOptions: {
				watchQuery: {
					fetchPolicy: 'network-only',
					errorPolicy: 'ignore',
				},
				query: {
					fetchPolicy: 'network-only',
					errorPolicy: 'all',
				},
			},
			cache: new InMemoryCache(),
		});
	}
}

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
