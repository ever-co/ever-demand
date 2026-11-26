import { NgModule } from '@angular/core';
import { TrackPage } from './track';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CarrierService } from '../../../src/services/carrier.service';
import { WarehousesService } from '../../../src/services/warehouses.service';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicSelectableComponent } from 'ionic-selectable';
// ionic-selectable 8 opens its modal through the standalone ModalController of Ionic 9
import { ModalController as StandaloneModalController } from '@ionic/angular';
import { WarehouseOrdersService } from '../../services/warehouse-orders.service';

const routes: Routes = [
	{
		path: '',
		component: TrackPage,
	},
];

@NgModule({
	declarations: [TrackPage],
	imports: [
		PipesModule,
		ComponentsModule,
		TranslateModule.forChild(),
		IonicSelectableComponent,
		IonicModule,
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
	],
	providers: [
		CarrierService,
		WarehousesService,
		WarehouseOrdersService,
		StandaloneModalController,
	],
})
export class TrackPageModule {}
