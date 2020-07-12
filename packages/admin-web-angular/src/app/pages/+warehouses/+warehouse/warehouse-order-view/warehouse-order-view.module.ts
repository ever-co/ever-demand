import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormWizardModule } from '@ever-co/angular2-wizard';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeModule } from '../../../../@theme';
import { NbSpinnerModule } from '@nebular/theme';
import { WarehouseOrderViewComponent } from './warehouse-order-view.component';
import { OrderHeaderInfoModule } from './order-header-info/order-header-info.module';
import { ImageSliderModule } from '../../../../@shared/render-component/image-slider/image-slider.module';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormWizardModule,
		Ng2SmartTableModule,
		TranslateModule.forChild(),
		NbSpinnerModule,
		OrderHeaderInfoModule,
		ImageSliderModule,
	],
	declarations: [WarehouseOrderViewComponent],
	exports: [WarehouseOrderViewComponent],
})
export class WarehouseOrderViewModule {}
