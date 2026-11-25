import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { DiscountComponent } from './discount/discount';
import { DeliveryInfoComponent } from './delivery-info/delivery-info';

@NgModule({
	imports: [IonicModule, CommonModule, TranslateModule.forChild()],
	exports: [DiscountComponent, DeliveryInfoComponent],
	declarations: [DiscountComponent, DeliveryInfoComponent],
})
export class ProductsModule {}
