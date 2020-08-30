import { NgModule } from '@angular/core';
import { SettingsPage } from './settings';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FileUploadModule } from 'ng2-file-upload';
import { GoogleMapModule } from '../../@shared/google-map/google-map.module';
import { ComponentsModule } from '../../components/components.module';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MerchantSettingsComponentModule } from 'components/settings-page-components/settings/settings.module';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const routes: Routes = [
	{
		path: '',
		component: SettingsPage,
	},
];

@NgModule({
	declarations: [SettingsPage],
	imports: [
		FileUploadModule,
		GoogleMapModule,
		ComponentsModule,
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		IonicModule,
		CommonModule,
		FormsModule,
		MerchantSettingsComponentModule,
		RouterModule.forChild(routes),
	],
})
export class SettingsPageModule {}
