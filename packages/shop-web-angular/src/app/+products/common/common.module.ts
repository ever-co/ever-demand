import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DiscountComponent } from './discount/discount';
import { DeliveryInfoComponent } from './delivery-info/delivery-info';

@NgModule({
	imports: [CommonModule, TranslateModule.forChild()],
	exports: [DiscountComponent, DeliveryInfoComponent],
	declarations: [DiscountComponent, DeliveryInfoComponent],
})
export class ProductsCommonModule {}
