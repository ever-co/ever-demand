import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormWizardModule } from '@app/@shared/wizard';
import { Ng2SmartTableModule } from '@app/@shared/smart-table';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { ThemeModule } from '../../../../@theme';
import { WarehouseSelectViewComponent } from './warehouse-select-view.component';
import { RouterModule } from '@angular/router';
import { JsonModalModule } from '../../../../@shared/json-modal/json-modal.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		Ng2SmartTableModule,
		TranslateModule.forChild(),
		RouterModule,
		NbSpinnerModule,
		JsonModalModule,
		NgSelectModule,
		FormsModule,
		NbButtonModule,
	],
	declarations: [WarehouseSelectViewComponent],
	exports: [WarehouseSelectViewComponent],
})
export class WarehouseSelectViewModule {}
