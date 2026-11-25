import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ElapsedTimeModule } from 'app/components/elapsed-time/elapsed-time.module';
import { OrderInfoCommonModule } from '../../../common/order-info-common.module';
import { OrderStoreInfo } from './store-info.component';
import { TakeawayCommonModule } from '../../common/takeaway-common.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule.forChild(),
        ElapsedTimeModule,
        OrderInfoCommonModule,
        TakeawayCommonModule,
    ],
    declarations: [OrderStoreInfo],
    providers: [],
    exports: [OrderStoreInfo]
})
export class OrderStoreInfoModule {}
