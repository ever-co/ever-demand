import { NgModule } from '@angular/core';
import { CarrierDeliveriesPopupPage } from './carrier-deliveries-popup';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { CustomerComponent } from '../../../components/carrier-deliveries-table/customer';
import { DeliveryComponent } from '../../../components/carrier-deliveries-table/delivery';
import { StatusComponent } from '../../../components/carrier-deliveries-table/status';
import { WarehouseComponent } from '../../../components/carrier-deliveries-table/warehouse';
import { IonCol, IonGrid, IonRow, ModalController } from '@ionic/angular';
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
        Angular2SmartTableModule,
        CommonModule,
        FormsModule,
        IonCol,
        IonGrid,
        IonRow,
    ],
    providers: [ModalController]
})
export class CarrierDeliveriesPopupPageModule {}
