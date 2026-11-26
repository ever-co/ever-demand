import { NgModule } from '@angular/core';
import { SettingsPage } from './settings';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploadModule } from 'ng2-file-upload';
import { GoogleMapModule } from '../../@shared/google-map/google-map.module';
import { ComponentsModule } from '../../components/components.module';
import { Routes, RouterModule } from '@angular/router';
import {
	IonIcon,
	IonMenuToggle,
	IonSegment,
	IonSegmentButton,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MerchantSettingsComponentModule } from '../../components/settings-page-components/settings/settings.module';


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
		TranslateModule.forChild(),
		CommonModule,
		FormsModule,
		MerchantSettingsComponentModule,
		RouterModule.forChild(routes),
		IonIcon,
		IonMenuToggle,
		IonSegment,
		IonSegmentButton,
	],
})
export class SettingsPageModule {}
