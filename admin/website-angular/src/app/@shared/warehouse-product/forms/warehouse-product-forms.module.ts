import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { ThemeModule } from '../../../@theme';
import { WarehouseAddChoiceComponent } from './warehouse-add-choice';
import { WarehouseProductsComponent } from './warehouse-products-table';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { RenderComponentsModule } from '../../render-component/render-components.module';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule.forChild(),
		Ng2SmartTableModule,
		RenderComponentsModule
	],
	exports: [WarehouseAddChoiceComponent, WarehouseProductsComponent],
	declarations: [WarehouseAddChoiceComponent, WarehouseProductsComponent]
})
export class WarehouseProductFormsModule {}
