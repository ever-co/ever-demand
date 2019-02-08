import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormWizardModule } from 'angular2-wizard';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { NbSpinnerModule } from '@nebular/theme';
import { ThemeModule } from '../../../../@theme';
import { WarehouseOrdersTableComponent } from './warehouse-orders-table.component';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		Ng2SmartTableModule,
		TranslateModule.forChild(),
		NbSpinnerModule
	],
	declarations: [WarehouseOrdersTableComponent],
	exports: [WarehouseOrdersTableComponent]
})
export class WarehouseOrdersTableModule {}
