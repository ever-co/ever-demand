import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from '@app/@shared/smart-table';
import { CarriersTableModule } from '@app/@shared/render-component/carriers-table/carriers-table.module';
import { CarriersSmartTableComponent } from './carriers-table.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';

@NgModule({
	imports: [
		CommonModule,
		Ng2SmartTableModule,
		CarriersTableModule,
		TranslateModule.forChild(),
	],
	declarations: [CarriersSmartTableComponent],
	exports: [CarriersSmartTableComponent],
})
export class CarriersSmartTableModule {}
