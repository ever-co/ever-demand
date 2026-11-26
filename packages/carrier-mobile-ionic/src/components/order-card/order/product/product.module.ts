import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ProductComponent } from './product.component';
import { Store } from '../../../../services/store.service';

@NgModule({
	imports: [CommonModule, TranslateModule.forChild()],
	providers: [Store],
	exports: [ProductComponent],
	declarations: [ProductComponent],
})
export class ProductModule {}
