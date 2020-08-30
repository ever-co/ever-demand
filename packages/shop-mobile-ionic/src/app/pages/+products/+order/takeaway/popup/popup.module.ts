import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
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
		IonicModule,
		TranslateModule.forChild(),
		CancelPageModule,
		IssuePageModule,
		OrderInfoCommonModule,
		ElapsedTimeModule,
		TakeawayCommonModule,
	],
	entryComponents: [OrderTakeawayInfoPopup],
	declarations: [OrderTakeawayInfoPopup],
	providers: [],
})
export class OrderTakeawayInfoPopupModule {}
