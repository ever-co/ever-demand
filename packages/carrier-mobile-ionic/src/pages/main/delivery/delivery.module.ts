import { NgModule } from '@angular/core';

import { DeliveryPage } from './delivery';
import { TranslateModule } from '@ngx-translate/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GeoLocationService } from '../../../services/geo-location.service';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MapModule } from '../common/map/map.module';

const routes: Routes = [
	{
		path: '',
		component: DeliveryPage,
	},
];

@NgModule({
	declarations: [DeliveryPage],
	imports: [
		CommonModule,
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		MapModule,
	],
	providers: [Geolocation, GeoLocationService],
})
export class DeliveryPageModule {}
