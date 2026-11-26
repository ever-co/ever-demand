import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { WarehouseLogoModule } from '../../warehouse-logo/warehouse-logo.module';
import { OrderComponent } from './order.component';
import { ProductModule } from './product/product.module';
import { Store } from '../../../services/store.service';
import { IonIcon } from '@ionic/angular';

@NgModule({
	imports: [
		CommonModule,
		WarehouseLogoModule,
		ProductModule,
		TranslateModule.forChild(),
		IonIcon,
	],
	providers: [Store],
	exports: [OrderComponent],
	declarations: [OrderComponent],
})
export class OrderModule {}
