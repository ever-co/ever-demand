import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { NoOrdersInfoComponent } from './no-orders-info/no-orders-info.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';

const COMPONENTS = [NoOrdersInfoComponent];

@NgModule({
	declarations: COMPONENTS,
	exports: COMPONENTS,
	providers: [],
	imports: [
		CommonModule,
		IonicModule,
		TranslateModule.forChild(),
	],
})
export class WarehouseCommonModule {}
