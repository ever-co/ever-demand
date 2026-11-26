import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormWizardModule } from '@app/@shared/wizard';
import { Ng2SmartTableModule } from '@app/@shared/smart-table';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { NbSpinnerModule } from '@nebular/theme';
import { ThemeModule } from '../../../../@theme';
import { WarehouseMainInfoViewComponent } from './warehouse-main-info.component';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		Ng2SmartTableModule,
		TranslateModule.forChild(),
		NbSpinnerModule,
	],
	declarations: [WarehouseMainInfoViewComponent],
	exports: [WarehouseMainInfoViewComponent],
})
export class WarehouseMainInfoViewModule {}
