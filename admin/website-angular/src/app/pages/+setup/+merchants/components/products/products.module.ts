import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from 'app/@theme';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SetupMerchantProductsComponent } from './products.component';
import { SetupMerchantProductsCatalogComponent } from './products-catalog/products-catalog.component';
import { ProductFormsModule } from 'app/@shared/product/forms';
import { SetupMerchantAddProductsComponent } from './add-products/add-products.component';

const COMPONENTS = [
	SetupMerchantProductsComponent,
	SetupMerchantProductsCatalogComponent,
	SetupMerchantAddProductsComponent
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		FormsModule,
		TranslateModule.forChild(),
		ProductFormsModule
	],
	declarations: COMPONENTS,
	exports: COMPONENTS
})
export class SetupMerchantsProductsModule {}
