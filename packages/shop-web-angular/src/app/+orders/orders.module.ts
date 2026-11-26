import { NgModule } from '@angular/core';
import { OrdersComponent } from './orders.component';
import { OrdersContainerComponent } from './orders.container.component';
import { routes } from './orders.routes';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { GoogleMapsModule } from '@angular/google-maps';
import { OrderComponent } from './order';
import { WarehouseLogoModule } from '../warehouse-logo';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { MessagePopUpModalModule } from 'app/shared/message-pop-up/message-pop-up.module';
import { CarrierLocationComponent } from './location/carrier-location.component';


@NgModule({
    declarations: [
        OrdersContainerComponent,
        OrdersComponent,
        OrderComponent,
        CarrierLocationComponent,
    ],
    imports: [
        CommonModule,
        MessagePopUpModalModule,
        TranslateModule,
        FormsModule,
        RouterModule.forChild(routes),
        MatDialogModule,
        MatButtonModule,
        MatCardModule,
        WarehouseLogoModule,
        GoogleMapsModule,
    ]
})
export class OrdersModule {}
