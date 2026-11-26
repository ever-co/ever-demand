import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonRow } from '@ionic/angular';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CancelPageModule } from '../../+cancel/cancel.module';
import { IssuePageModule } from '../../issue/issue.module';
import { OrderInfoCommonModule } from '../../common/order-info-common.module';
import { OrderTakeawayInfoPopup } from './popup.component';
import { ElapsedTimeModule } from 'app/components/elapsed-time/elapsed-time.module';
import { TakeawayCommonModule } from '../common/takeaway-common.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonRow,
        TranslateModule.forChild(),
        CancelPageModule,
        IssuePageModule,
        OrderInfoCommonModule,
        ElapsedTimeModule,
        TakeawayCommonModule,
    ],
    declarations: [OrderTakeawayInfoPopup],
    providers: []
})
export class OrderTakeawayInfoPopupModule {}
