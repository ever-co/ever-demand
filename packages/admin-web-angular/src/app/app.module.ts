import {
	inject,
	NgModule,
	provideAppInitializer,
	provideZoneChangeDetection,
} from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
	provideHttpClient,
	withInterceptorsFromDi,
	withXhr,
} from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NbToastrModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideEchartsCore } from 'ngx-echarts';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CommonModule } from '@modules/client.common.angular2/common.module';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { ServerConnectionService } from '@modules/client.common.angular2/services/server-connection.service';
import { environment } from 'environments/environment';
import { FormWizardModule } from './@shared/wizard';
import { ToasterModule } from './@core/toaster';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Store } from './@core/data/store.service';
import { AppModuleGuard } from './app.module.guard';
import { MaintenanceModuleGuard } from './pages/+maintenance-info/maintenance-info.module.guard';
import { ServerSettingsService } from './@core/services/server-settings.service';
import { provideGraphQL } from './graphql/graphql.providers';
import { loadGoogleMaps } from './@core/utils/google-maps-loader';

// It's more 'standard' way to use Font-Awesome module and special package,
// but for some reason ngx-admin works without it. So we leave next line commented for now.
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		FormWizardModule,
		ToasterModule.forRoot(),
		BrowserAnimationsModule,
		AppRoutingModule,
		TranslateModule.forRoot({
			loader: provideTranslateHttpLoader({
				prefix: './assets/i18n/',
				suffix: '.json',
			}),
		}),
		CommonModule.forRoot({ apiUrl: environment.SERVICES_ENDPOINT }),
		NgbModule,
		NbEvaIconsModule,
		ThemeModule.forRoot(),
		NbToastrModule.forRoot(),
		CoreModule.forRoot(),
	],
	declarations: [AppComponent],
	bootstrap: [AppComponent],
	providers: [
		// The app relies on Zone.js change detection (Angular 21+ defaults to zoneless).
		provideZoneChangeDetection(),
		provideHttpClient(withXhr(), withInterceptorsFromDi()),
		provideGraphQL(),
		provideEchartsCore({ echarts: () => import('echarts') }),
		provideHighlightOptions({
			fullLibraryLoader: () => import('highlight.js'),
		}),
		ServerConnectionService,
		provideAppInitializer(() =>
			inject(ServerConnectionService).load(
				environment.SERVICES_ENDPOINT,
				inject(Store),
			),
		),
		provideAppInitializer(() =>
			loadGoogleMaps(environment.GOOGLE_MAPS_API_KEY),
		),
		MaintenanceService,
		provideAppInitializer(() =>
			inject(MaintenanceService).load(
				environment['SETTINGS_APP_TYPE'],
				environment['SETTINGS_MAINTENANCE_API_URL'],
			),
		),
		provideAppInitializer(() => inject(ServerSettingsService).load()),
		{ provide: APP_BASE_HREF, useValue: '/' },
		AppModuleGuard,
		MaintenanceModuleGuard,
	],
})
export class AppModule {}
