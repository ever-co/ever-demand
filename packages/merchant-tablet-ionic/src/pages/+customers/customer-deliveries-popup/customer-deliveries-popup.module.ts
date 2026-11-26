import { NgModule } from '@angular/core';
import { CustomerDeliveriesPopupPage } from './customer-deliveries-popup';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { OrderIdComponent } from '../../../components/customer-deliveries-table/orderId';
import { DeliveryComponent } from '../../../components/customer-deliveries-table/delivery';
import { AddressComponent } from '../../../components/customer-deliveries-table/address';
import { StatusComponent } from '../../../components/customer-deliveries-table/status';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';

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
        Angular2SmartTableModule,
        IonicModule,
        CommonModule,
        FormsModule,
    ]
})
export class CustomerDeliveriesPopupPageModule {}
