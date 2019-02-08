import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule, HttpLoaderFactory } from 'app/@theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ProductsTableComponent } from './products-table.component';
import { ToasterModule } from 'angular2-toaster';
import { StoreProductsTableModule } from 'app/@shared/render-component/store-products-table/store-products-table.module';
import { RenderComponentsModule } from 'app/@shared/render-component/render-components.module';
import { ProductCategoriesModule } from 'app/@shared/render-component/product-categories/product-categories.module';
import { NbSpinnerModule } from '@nebular/theme';
import { ConfirmationModalModule } from '../../../../@shared/confirmation-modal/confirmation-modal.module';

const COMPONENTS = [ProductsTableComponent];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		Ng2SmartTableModule,
		ToasterModule.forChild(),
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient]
			}
		}),
		StoreProductsTableModule,
		RenderComponentsModule,
		ProductCategoriesModule,
		NbSpinnerModule,
		ConfirmationModalModule
	],
	declarations: [...COMPONENTS],
	exports: [...COMPONENTS]
})
export class ProductsTableModule {}
