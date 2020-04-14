import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WarehouseLogoModule } from '../warehouse-logo/warehouse-logo.module';
import { ProductComponent } from './product/product.component';
import { OrderComponent } from './order.component';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		WarehouseLogoModule,
		TranslateModule.forChild(),
	],
	exports: [OrderComponent],
	declarations: [ProductComponent, OrderComponent],
})
export class OrderModule {}
