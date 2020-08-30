import { NgModule } from '@angular/core';
import { HomePage } from './home';
import { TranslateModule } from '@ngx-translate/core';
import { GeoLocationOrdersService } from '../../../services/geo-location-order.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GeoLocationService } from '../../../services/geo-location.service';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MapModule } from '../common/map/map.module';

const routes: Routes = [
	{
		path: '',
		component: HomePage,
	},
];

@NgModule({
	declarations: [HomePage],
	imports: [
		IonicModule,
		CommonModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		MapModule,
	],
	providers: [GeoLocationOrdersService, Geolocation, GeoLocationService],
})
export class HomePageModule {}
