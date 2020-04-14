import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OrderProductsInfo } from './products-info.component';
import { TranslateModule } from '@ngx-translate/core';
import { OrderInfoCommonModule } from '../../../common/order-info-common.module';
import { TakeawayCommonModule } from '../../common/takeaway-common.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		TranslateModule.forChild(),
		OrderInfoCommonModule,
		TakeawayCommonModule,
	],
	entryComponents: [],
	declarations: [OrderProductsInfo],
	providers: [],
	exports: [OrderProductsInfo],
})
export class OrderProductsInfoModule {}
