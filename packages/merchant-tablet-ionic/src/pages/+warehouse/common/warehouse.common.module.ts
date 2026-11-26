import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { NoOrdersInfoComponent } from './no-orders-info/no-orders-info.component';
import { CommonModule } from '@angular/common';

const COMPONENTS = [NoOrdersInfoComponent];

@NgModule({
	declarations: COMPONENTS,
	exports: COMPONENTS,
	providers: [],
	imports: [
		CommonModule,
		TranslateModule.forChild(),
	],
})
export class WarehouseCommonModule {}
