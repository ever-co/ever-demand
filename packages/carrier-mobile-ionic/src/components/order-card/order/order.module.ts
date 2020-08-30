import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WarehouseLogoModule } from '../../warehouse-logo/warehouse-logo.module';
import { OrderComponent } from './order.component';
import { ProductModule } from './product/product.module';
import { Store } from '../../../services/store.service';
import { IonicModule } from '@ionic/angular';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		WarehouseLogoModule,
		ProductModule,
		TranslateModule.forChild(),
	],
	providers: [Store],
	exports: [OrderComponent],
	declarations: [OrderComponent],
})
export class OrderModule {}
