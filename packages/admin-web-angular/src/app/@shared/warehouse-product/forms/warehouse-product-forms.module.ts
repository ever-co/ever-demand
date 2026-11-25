import { NgModule } from '@angular/core';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FormWizardModule } from '@app/@shared/wizard';
import { ThemeModule } from '../../../@theme';
import { WarehouseAddChoiceComponent } from './warehouse-add-choice';
import { AddWarehouseProductsComponent } from './add-warehouse-products-table';
import { Ng2SmartTableModule } from '@app/@shared/smart-table';
import { RenderComponentsModule } from '../../render-component/render-components.module';
import { WarehouseProductsComponent } from './warehouse-products-table';
import { StoreProductsTableModule } from '@app/@shared/render-component/store-products-table/store-products-table.module';
import { ProductCategoriesModule } from '@app/@shared/render-component/product-categories/product-categories.module';

const COMPONENTS = [
	WarehouseAddChoiceComponent,
	AddWarehouseProductsComponent,
	WarehouseProductsComponent,
];

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule.forChild(),
		Ng2SmartTableModule,
		RenderComponentsModule,
		StoreProductsTableModule,
		ProductCategoriesModule,
	],
	exports: COMPONENTS,
	declarations: COMPONENTS,
})
export class WarehouseProductFormsModule {}
