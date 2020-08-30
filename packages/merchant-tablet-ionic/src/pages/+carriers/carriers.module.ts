import { NgModule } from '@angular/core';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { CarriersPage } from './carriers';
import { WarehouseCarriersRouter } from '@modules/client.common.angular2/routers/warehouse-carriers-router.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AddressesComponent } from '../../components/carriers-table/addresses';
import { StatusComponent } from '../../components/carriers-table/status';
import { DeliveriesComponent } from '../../components/carriers-table/deliveries';
import { ImageComponent } from '../../components/carriers-table/image';
import { PhoneComponent } from '../../../src/components/carriers-table/phone';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddCarriersPopupPageModule } from './add-carriers-popup/add-carriers-popup.module';
import { CarrierAddrPopupPageModule } from './carrier-addr-popup/carrier-addr-popup.module';
import { CarrierDeliveriesPopupPageModule } from './carrier-deliveries-popup/carrier-deliveries-popup.module';
import { CarrierEditPopupModule } from './carrier-edit-popup/carrier-edit-popup.module';
import { CarrierTrackPopupModule } from './carrier-track-popup/carrier-track-popup.module';
import { ConfirmDeletePopupModule } from 'components/confirm-delete-popup/confirm-delete-popup.module';

const routes: Routes = [
	{
		path: '',
		component: CarriersPage,
	},
];

@NgModule({
	declarations: [
		CarriersPage,
		ImageComponent,
		AddressesComponent,
		StatusComponent,
		DeliveriesComponent,
	],
	imports: [
		PipesModule,
		ComponentsModule,
		TranslateModule.forChild(),
		Ng2SmartTableModule,
		IonicModule,
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		AddCarriersPopupPageModule,
		CarrierAddrPopupPageModule,
		CarrierDeliveriesPopupPageModule,
		CarrierEditPopupModule,
		ConfirmDeletePopupModule,
		CarrierTrackPopupModule,
	],
	entryComponents: [
		ImageComponent,
		AddressesComponent,
		StatusComponent,
		DeliveriesComponent,
		PhoneComponent,
	],
	providers: [WarehouseCarriersRouter],
})
export class CarrierssPageModule {}
