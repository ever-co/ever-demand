import {
	NgModule,
	inject,
	provideAppInitializer,
	provideZoneChangeDetection,
} from '@angular/core';
import {
	provideHttpClient,
	withInterceptorsFromDi,
	withXhr,
} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import {
	IonApp,
	IonicRouteStrategy,
	IonRouterOutlet,
	provideIonicAngular,
} from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { Capacitor } from '@capacitor/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getOperationAST } from 'graphql';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CommonModule } from '@modules/client.common.angular2/common.module';
import { tenantHeaders } from '@modules/client.common.angular2/lib/tenant';
import { GoogleMapsLoader } from '@modules/client.common.angular2/services/googleMapsLoader';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { environment } from 'environments/environment';
import { MenuModule } from './components/menu/menu.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Store } from './services/store.service';
import { ServerSettings } from './services/server-settings';
import { PagesModuleGuard } from './pages/pages.module.guard';
import { MaintenanceModuleGuard } from './maintenance-info/maintenance-info.module.guard';
import { CallPageModule } from './pages/+products/+order/+call/call.module';
import { shopTenantConfig, subscriptionParams } from './tenant';

// Apollo Client 4 types the default options: declare the error policies the
// app uses (see apolloOptionsFactory).
declare module '@apollo/client' {
	namespace ApolloClient {
		namespace DeclareDefaultOptions {
			interface WatchQuery {
				errorPolicy: 'ignore';
			}
			interface Query {
				errorPolicy: 'all';
			}
		}
	}
}

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		MenuModule,
		CallPageModule,
		IonApp,
		IonRouterOutlet,
		IonicStorageModule.forRoot(),
		TranslateModule.forRoot({
			loader: provideTranslateHttpLoader({
				prefix: './assets/i18n/',
				suffix: '.json',
			}),
			fallbackLang: 'en-US',
		}),
		CommonModule.forRoot({
			apiUrl: environment.SERVICES_ENDPOINT,
			// every socket handshake names the shop's tenant (and the
			// customer's token, when logged in): DESIGN.md §3.3
			tenant: shopTenantConfig(),
			tokenStorageKey: 'token',
		}),
	],
	providers: [
		// Standalone Ionic (IonicModule.forRoot() is deprecated): same, empty config.
		provideIonicAngular(),
		// The app relies on zone.js change detection (mutated fields,
		// getters, setInterval timers), so keep it explicitly: Angular 21+
		// defaults to zoneless.
		provideZoneChangeDetection(),
		provideHttpClient(withXhr(), withInterceptorsFromDi()),
		provideApollo(apolloOptionsFactory),
		// A service worker only makes sense for the web build; the native
		// app serves its files from the device.
		provideServiceWorker('ngsw-worker.js', {
			enabled: environment.production && !Capacitor.isNativePlatform(),
		}),
		ServerConnectionService,
		GoogleMapsLoader,
		MaintenanceService,
		ServerSettings,
		// Same order as before. Angular starts every initializer, then
		// waits for all of them.
		provideAppInitializer(() =>
			inject(ServerConnectionService).load(
				environment.SERVICES_ENDPOINT,
				inject(Store),
			),
		),
		provideAppInitializer(() =>
			inject(GoogleMapsLoader).load(environment.GOOGLE_MAPS_API_KEY),
		),
		provideAppInitializer(() =>
			inject(MaintenanceService).load(
				environment['SETTINGS_APP_TYPE'],
				environment['SETTINGS_MAINTENANCE_API_URL'],
			),
		),
		provideAppInitializer(() => inject(ServerSettings).load()),
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		PagesModuleGuard,
		MaintenanceModuleGuard,
	],
	bootstrap: [AppComponent],
})
export class AppModule {}

export function apolloOptionsFactory(): ApolloClient.Options {
	const httpLink = inject(HttpLink);
	const store = inject(Store);

	// Create an http link
	const http = httpLink.create({
		uri: environment.GQL_ENDPOINT,
	});

	// Subscriptions use the graphql-ws protocol (subscriptions-transport-ws
	// is dead). Lazy, and it keeps reconnecting like the old link did.
	const ws = new GraphQLWsLink(
		createClient({
			url: environment.GQL_SUBSCRIPTIONS_ENDPOINT,
			// The API reads the token and the tenant from the connection params
			// (graphql-ws has no HTTP headers); read when the socket (re)connects.
			connectionParams: () => subscriptionParams(store.token),
			lazy: true,
			retryAttempts: Infinity,
			shouldRetry: () => true,
		}),
	);

	const authLink = new SetContextLink((prevContext) => {
		// get the authentication token from local storage if it exists
		const token = store.token;
		// return the headers to the context so httpLink can read them
		return {
			headers: {
				...prevContext.headers,
				// customers belong to one tenant: name it (DESIGN.md §3.3)
				...tenantHeaders(shopTenantConfig()),
				authorization: token ? `Bearer ${token}` : '',
			},
		};
	});

	return {
		link: authLink.concat(
			ApolloLink.split(
				(operation) => {
					const operationAST = getOperationAST(
						operation.query,
						operation.operationName,
					);
					return (
						!!operationAST &&
						operationAST.operation === 'subscription'
					);
				},
				ws,
				http,
			),
		),
		defaultOptions: {
			watchQuery: {
				fetchPolicy: 'network-only',
				errorPolicy: 'ignore',
				// Apollo Client 4 turned this on by default; the pages expect
				// one emission per result, as with Apollo Client 3.
				notifyOnNetworkStatusChange: false,
			},
			query: {
				fetchPolicy: 'network-only',
				errorPolicy: 'all',
			},
		},
		cache: new InMemoryCache(),
	};
}
