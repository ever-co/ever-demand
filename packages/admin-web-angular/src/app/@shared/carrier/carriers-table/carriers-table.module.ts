import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { CarriersTableModule } from '@app/@shared/render-component/carriers-table/carriers-table.module';
import { CarriersSmartTableComponent } from './carriers-table.component';
import { TranslateModule } from '@ngx-translate/core';

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
