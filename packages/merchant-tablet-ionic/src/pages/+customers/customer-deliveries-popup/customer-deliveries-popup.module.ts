import { NgModule } from '@angular/core';
import { CustomerDeliveriesPopupPage } from './customer-deliveries-popup';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { OrderIdComponent } from '../../../components/customer-deliveries-table/orderId';
import { DeliveryComponent } from '../../../components/customer-deliveries-table/delivery';
import { AddressComponent } from '../../../components/customer-deliveries-table/address';
import { StatusComponent } from '../../../components/customer-deliveries-table/status';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
	declarations: [
		CustomerDeliveriesPopupPage,
		OrderIdComponent,
		DeliveryComponent,
		AddressComponent,
		StatusComponent,
	],
	imports: [
		TranslateModule.forChild(),
		Ng2SmartTableModule,
		IonicModule,
		CommonModule,
		FormsModule,
	],
	entryComponents: [
		CustomerDeliveriesPopupPage,
		OrderIdComponent,
		DeliveryComponent,
		AddressComponent,
		StatusComponent,
	],
})
export class CustomerDeliveriesPopupPageModule {}
