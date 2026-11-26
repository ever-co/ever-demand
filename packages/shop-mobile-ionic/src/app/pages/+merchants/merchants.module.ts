import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonAvatar,
	IonButton,
	IonButtons,
	IonCol,
	IonContent,
	IonHeader,
	IonItem,
	IonLabel,
	IonList,
	IonListHeader,
	IonMenuButton,
	IonRow,
	IonSearchbar,
	IonTitle,
	IonToolbar,
} from '@ionic/angular';
import { MerchantsPage } from './merchants.page';
import { GeoLocationsMerchantsService } from 'app/services/geo-location-merchants.service';
import { GeoLocationService } from 'app/services/geo-location';
import { MerchantsService } from 'app/services/merchants/merchants.service';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

const routes: Routes = [
	{
		path: '',
		component: MerchantsPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonAvatar,
		IonButton,
		IonButtons,
		IonCol,
		IonContent,
		IonHeader,
		IonItem,
		IonLabel,
		IonList,
		IonListHeader,
		IonMenuButton,
		IonRow,
		IonSearchbar,
		IonTitle,
		IonToolbar,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
	declarations: [MerchantsPage],
	providers: [
		GeoLocationsMerchantsService,
		GeoLocationService,
		MerchantsService,
	],
})
export class MerchantsPageModule {}
