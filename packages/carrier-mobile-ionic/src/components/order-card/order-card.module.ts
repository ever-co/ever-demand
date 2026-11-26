import { NgModule } from '@angular/core';

import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderCardComponent } from './order-card';
import { OrderModule } from './order/order.module';
import { ProductModule } from './order/product/product.module';
import { WarehouseLogoModule } from '../warehouse-logo/warehouse-logo.module';
import { IonicModule } from '@ionic/angular/lazy';

@NgModule({
	declarations: [OrderCardComponent],
	exports: [OrderCardComponent],
	imports: [
		CommonModule,
		FormsModule,
		OrderModule,
		IonicModule,
		ProductModule,
		WarehouseLogoModule,
		TranslateModule.forChild(),
	],
})
export class OrderCardModule {}
