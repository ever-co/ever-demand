import { NgModule } from '@angular/core';
import { MainPage } from './main';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { TranslateModule } from '@ngx-translate/core';
import { GeoLocationService } from '../../services/geo-location.service';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HomeModuleGuard } from './home/home.module.guard';
import { DeliveryModuleGuard } from './delivery/delivery.module.guard';
import { StartingDeliveryModuleGuard } from './starting-delivery/starting-delivery.module.guard';
import { DriveToWarehouseModuleGuard } from './drive-to-warehouse/drive-to-warehouse.module.guard';

const routes: Routes = [
	{
		path: '',
		component: MainPage,
		children: [
			{
				path: 'home',
				loadChildren: './home/home.module#HomePageModule',
				canLoad: [HomeModuleGuard]
			},
			{
				path: 'drive-to-warehouse',
				loadChildren:
					'./drive-to-warehouse/drive-to-warehouse.module#DriveToWarehousePageModule',
				canLoad: [DriveToWarehouseModuleGuard]
			},
			{
				path: 'starting-delivery',
				loadChildren:
					'./starting-delivery/starting-delivery.module#StartingDeliveryPageModule',
				canLoad: [StartingDeliveryModuleGuard]
			},
			{
				path: 'delivery',
				loadChildren: './delivery/delivery.module#DeliveryPageModule',
				canLoad: [DeliveryModuleGuard]
			},
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'home'
			}
		]
	}
];

@NgModule({
	declarations: [MainPage],
	imports: [
		IonicModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild()
	],
	entryComponents: [MainPage],
	providers: [
		Geolocation,
		Vibration,
		LocalNotifications,
		GeoLocationService,
		HomeModuleGuard,
		DriveToWarehouseModuleGuard,
		StartingDeliveryModuleGuard,
		DeliveryModuleGuard
	]
})
export class MainPageModule {}
