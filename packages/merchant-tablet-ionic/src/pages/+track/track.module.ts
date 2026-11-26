import { NgModule } from '@angular/core';
import { TrackPage } from './track';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CarrierService } from '../../../src/services/carrier.service';
import { WarehousesService } from '../../../src/services/warehouses.service';
import { Routes, RouterModule } from '@angular/router';
import {
	IonCheckbox,
	IonIcon,
	IonItem,
	IonLabel,
	IonMenuToggle,
	ModalController,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicSelectableComponent } from 'ionic-selectable';
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
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		IonCheckbox,
		IonIcon,
		IonItem,
		IonLabel,
		IonMenuToggle,
	],
	providers: [
		CarrierService,
		WarehousesService,
		WarehouseOrdersService,
		// page-level ModalController: ionic-selectable's modal and the popups opened
		// here resolve this module's services
		ModalController,
	],
})
export class TrackPageModule {}
