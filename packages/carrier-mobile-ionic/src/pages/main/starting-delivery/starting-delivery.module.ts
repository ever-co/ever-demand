import { NgModule } from '@angular/core';
import { StartingDeliveryPage } from './starting-delivery';
import { TranslateModule } from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';
import { MapModule } from '../common/map/map.module';
import { CommonModule } from '@angular/common';

const routes: Routes = [
	{
		path: '',
		component: StartingDeliveryPage,
	},
];

@NgModule({
	declarations: [StartingDeliveryPage],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		MapModule,
	],
})
export class StartingDeliveryPageModule {}
