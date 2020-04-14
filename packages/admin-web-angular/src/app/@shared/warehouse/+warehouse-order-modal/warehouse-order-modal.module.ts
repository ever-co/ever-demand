import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ThemeModule } from '../../../@theme';
import { WarehouseOrderModalComponent } from './warehouse-order-modal.component';
import { WarehouseOrderInputComponent } from './warehouse-order-input.component';
import { TranslateModule } from '@ngx-translate/core';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';

const COMPONENTS = [WarehouseOrderModalComponent, WarehouseOrderInputComponent];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		Ng2SmartTableModule,
		NbSpinnerModule,
		NbSpinnerModule,
		TranslateModule.forChild(),
		NbButtonModule,
	],
	declarations: [WarehouseOrderModalComponent, WarehouseOrderInputComponent],
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
})
export class WarehouseOrderModalModule {}
