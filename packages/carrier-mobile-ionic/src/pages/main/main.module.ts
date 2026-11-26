import { NgModule } from '@angular/core';
import { MainPage } from './main';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { GeoLocationService } from '../../services/geo-location.service';
import { Routes, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonMenuToggle } from '@ionic/angular/ion-menu-toggle';
import { IonRouterOutlet } from '@ionic/angular/ion-router-outlet';
import { IonTitle } from '@ionic/angular/ion-title';
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
				loadChildren: () =>
					import('./home/home.module').then((m) => m.HomePageModule),
				canLoad: [HomeModuleGuard],
			},
			{
				path: 'drive-to-warehouse',
				loadChildren: () =>
					import(
						'./drive-to-warehouse/drive-to-warehouse.module'
					).then((m) => m.DriveToWarehousePageModule),
				canLoad: [DriveToWarehouseModuleGuard],
			},
			{
				path: 'starting-delivery',
				loadChildren: () =>
					import('./starting-delivery/starting-delivery.module').then(
						(m) => m.StartingDeliveryPageModule
					),
				canLoad: [StartingDeliveryModuleGuard],
			},
			{
				path: 'delivery',
				loadChildren: () =>
					import('./delivery/delivery.module').then(
						(m) => m.DeliveryPageModule
					),
				canLoad: [DeliveryModuleGuard],
			},
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'home',
			},
		],
	},
];

@NgModule({
    declarations: [MainPage],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        TranslateModule.forChild(),
        IonContent,
        IonHeader,
        IonIcon,
        IonMenuToggle,
        IonRouterOutlet,
        IonTitle,
    ],
    providers: [
        GeoLocationService,
        HomeModuleGuard,
        DriveToWarehouseModuleGuard,
        StartingDeliveryModuleGuard,
        DeliveryModuleGuard,
    ]
})
export class MainPageModule {}
