import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MerchantsPage } from './merchants.page';
import { GeoLocationsMerchantsService } from 'app/services/geo-location-merchants.service';
import { GeoLocationService } from 'app/services/geo-location';
import { MerchantsService } from 'app/services/merchants/merchants.service';
import { TranslateModule } from '@ngx-translate/core';

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
		IonicModule,
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
