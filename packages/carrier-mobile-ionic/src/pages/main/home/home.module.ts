import { NgModule } from '@angular/core';
import { HomePage } from './home';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { GeoLocationOrdersService } from '../../../services/geo-location-order.service';
import { GeoLocationService } from '../../../services/geo-location.service';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
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
	providers: [GeoLocationOrdersService, GeoLocationService],
})
export class HomePageModule {}
