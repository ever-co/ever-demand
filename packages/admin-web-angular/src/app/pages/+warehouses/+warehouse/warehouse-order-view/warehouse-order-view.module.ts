import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormWizardModule } from 'angular2-wizard';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeModule } from '../../../../@theme';
import { NbSpinnerModule } from '@nebular/theme';
import { WarehouseOrderViewComponent } from './warehouse-order-view.component';
import { OrderHeaderInfoModule } from './order-header-info/order-header-info.module';
import { SlideshowModule } from 'ng-simple-slideshow';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		Ng2SmartTableModule,
		TranslateModule.forChild(),
		NbSpinnerModule,
		OrderHeaderInfoModule,
		SlideshowModule,
	],
	declarations: [WarehouseOrderViewComponent],
	exports: [WarehouseOrderViewComponent],
})
export class WarehouseOrderViewModule {}
