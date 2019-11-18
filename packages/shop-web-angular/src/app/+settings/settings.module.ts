import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { routes } from './settings.routes';
import {
	MatButtonModule,
	MatCardModule,
	MatCheckboxModule,
	MatIconModule,
	MatListModule,
	MatSidenavModule,
	MatToolbarModule,
	MatFormFieldModule,
	MatInputModule,
	MatSelectModule
} from '@angular/material';
import { RouterModule } from '@angular/router';
import { WarehouseLogoModule } from '../warehouse-logo';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SettingsComponent } from 'app/+settings/settings.component';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
	declarations: [SettingsComponent],
	imports: [
		CommonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		}),
		FormsModule,
		RouterModule.forChild(routes),
		LazyLoadImageModule,
		WarehouseLogoModule,
		MatIconModule,
		MatButtonModule,
		MatSidenavModule,
		MatToolbarModule,
		MatCheckboxModule,
		MatListModule,
		MatCardModule
	]
})
export class SettingsModule {
	public static routes = routes;
}
