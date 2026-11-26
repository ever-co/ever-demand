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
import { IonCol } from '@ionic/angular/ion-col';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonRow } from '@ionic/angular/ion-row';
import { ModalController } from '@ionic/angular/modal-controller';

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
        CommonModule,
        FormsModule,
        IonCol,
        IonGrid,
        IonRow,
    ],
    providers: [ModalController]
})
export class CustomerDeliveriesPopupPageModule {}
