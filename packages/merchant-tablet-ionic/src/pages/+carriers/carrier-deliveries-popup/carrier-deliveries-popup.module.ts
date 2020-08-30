import { NgModule } from '@angular/core';
import { CarrierDeliveriesPopupPage } from './carrier-deliveries-popup';
import { TranslateModule } from '@ngx-translate/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { CustomerComponent } from '../../../components/carrier-deliveries-table/customer';
import { DeliveryComponent } from '../../../components/carrier-deliveries-table/delivery';
import { StatusComponent } from '../../../components/carrier-deliveries-table/status';
import { WarehouseComponent } from '../../../components/carrier-deliveries-table/warehouse';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const COMPONENTS = [
	CarrierDeliveriesPopupPage,
	CustomerComponent,
	DeliveryComponent,
	StatusComponent,
	WarehouseComponent,
];

@NgModule({
	declarations: COMPONENTS,
	imports: [
		TranslateModule.forChild(),
		Ng2SmartTableModule,
		IonicModule,
		CommonModule,
		FormsModule,
	],
	entryComponents: COMPONENTS,
})
export class CarrierDeliveriesPopupPageModule {}
