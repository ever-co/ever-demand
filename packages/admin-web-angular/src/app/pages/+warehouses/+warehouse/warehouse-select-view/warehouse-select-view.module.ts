import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormWizardModule } from 'angular2-wizard';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
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
