import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CancelPageModule } from '../+cancel/cancel.module';
import { IssuePageModule } from '../issue/issue.module';
import { ElapsedTimeModule } from 'app/components/elapsed-time/elapsed-time.module';
import { DirectionsLocationComponent } from './carreir-location/carreir-location';
import { OrderInfoHeaderComponent } from './header/order-info-header.component';
import { PaymentComponent } from './payment/payment.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { OrdersCardModule } from 'app/pages/+orders-history/order-card/order-card.module';
import { OrderInfoModalComponent } from './order-info-modal/order-info-modal.component';

const COMPONENTS = [
	DirectionsLocationComponent,
	OrderInfoHeaderComponent,
	PaymentComponent,
	MapModalComponent,
	OrderInfoHeaderComponent,
	OrderInfoModalComponent,
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule.forChild(),
        CancelPageModule,
        IssuePageModule,
        ElapsedTimeModule,
        OrdersCardModule,
    ],
    declarations: [...COMPONENTS],
    exports: [...COMPONENTS],
    providers: []
})
export class OrderInfoCommonModule {}
