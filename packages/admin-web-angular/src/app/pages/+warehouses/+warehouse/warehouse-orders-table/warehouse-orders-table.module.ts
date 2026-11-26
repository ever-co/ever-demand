import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormWizardModule } from '@app/@shared/wizard';
import { Ng2SmartTableModule } from '@app/@shared/smart-table';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { ThemeModule } from '../../../../@theme';
import { WarehouseOrdersTableComponent } from './warehouse-orders-table.component';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		Ng2SmartTableModule,
		TranslateModule.forChild(),
		NbSpinnerModule,
		NbButtonModule,
	],
	declarations: [WarehouseOrdersTableComponent],
	exports: [WarehouseOrdersTableComponent],
})
export class WarehouseOrdersTableModule {}
