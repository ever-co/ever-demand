import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderModule } from 'app/components/order/order.module';
import { OrderCardComponent } from './order-card.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        OrderModule,
        RouterModule,
        TranslateModule.forChild(),
    ],
    declarations: [OrderCardComponent],
    exports: [OrderCardComponent]
})
export class OrdersCardModule {}
