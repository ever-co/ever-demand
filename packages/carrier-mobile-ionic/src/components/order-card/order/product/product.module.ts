import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProductComponent } from './product.component';
import { Store } from '../../../../services/store.service';
import { IonicModule } from '@ionic/angular';

@NgModule({
	imports: [IonicModule, CommonModule, TranslateModule.forChild()],
	providers: [Store],
	exports: [ProductComponent],
	declarations: [ProductComponent],
})
export class ProductModule {}
