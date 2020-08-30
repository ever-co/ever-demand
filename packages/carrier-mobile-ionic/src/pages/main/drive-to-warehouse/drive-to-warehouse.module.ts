import { NgModule } from '@angular/core';
import { DriveToWarehousePage } from './drive-to-warehouse';
import { TranslateModule } from '@ngx-translate/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GeoLocationService } from '../../../services/geo-location.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MapModule } from '../common/map/map.module';

const routes: Routes = [
	{
		path: '',
		component: DriveToWarehousePage,
	},
];

@NgModule({
	declarations: [DriveToWarehousePage],
	imports: [
		IonicModule,
		CommonModule,
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		MapModule,
	],
	providers: [Geolocation, GeoLocationService],
})
export class DriveToWarehousePageModule {}
