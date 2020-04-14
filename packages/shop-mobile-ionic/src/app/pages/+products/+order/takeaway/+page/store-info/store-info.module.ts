import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
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
	entryComponents: [],
	declarations: [OrderStoreInfo],
	providers: [],
	exports: [OrderStoreInfo],
})
export class OrderStoreInfoModule {}
