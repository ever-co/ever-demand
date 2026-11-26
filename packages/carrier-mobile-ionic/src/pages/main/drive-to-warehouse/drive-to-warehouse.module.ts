import { NgModule } from '@angular/core';
import { DriveToWarehousePage } from './drive-to-warehouse';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { GeoLocationService } from '../../../services/geo-location.service';
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
		CommonModule,
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		MapModule,
	],
	providers: [GeoLocationService],
})
export class DriveToWarehousePageModule {}
