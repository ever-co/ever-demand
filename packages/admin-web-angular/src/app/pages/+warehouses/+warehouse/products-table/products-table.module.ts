import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '@app/@theme';
import { TranslateModule } from '@app/@shared/translate/translate.module';
import { ProductsTableComponent } from './products-table.component';
import { ToasterModule } from 'angular2-toaster';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { ConfirmationModalModule } from '../../../../@shared/confirmation-modal/confirmation-modal.module';
import { WarehouseProductFormsModule } from '@app/@shared/warehouse-product/forms';

const COMPONENTS = [ProductsTableComponent];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		ToasterModule.forChild(),
		TranslateModule,
		NbSpinnerModule,
		ConfirmationModalModule,
		WarehouseProductFormsModule,
		NbButtonModule,
	],
	declarations: [...COMPONENTS],
	exports: [...COMPONENTS],
})
export class ProductsTableModule {}
