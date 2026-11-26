import { NgModule } from '@angular/core';
import { IonImg } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { WarehouseLogoModule } from '../warehouse-logo/warehouse-logo.module';
import { ProductComponent } from './product/product.component';
import { OrderComponent } from './order.component';

@NgModule({
	imports: [
		IonImg,
		CommonModule,
		WarehouseLogoModule,
		TranslateModule.forChild(),
	],
	exports: [OrderComponent],
	declarations: [ProductComponent, OrderComponent],
})
export class OrderModule {}
