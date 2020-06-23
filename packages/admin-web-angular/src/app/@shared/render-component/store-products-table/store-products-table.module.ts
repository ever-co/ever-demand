import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../../@theme';
import { StoreProductImageComponent } from './store-product-image/store-product-image.component';
import { StoreProductPriceComponent } from './store-product-price.component';
import { StoreProductQtyComponent } from './store-product-qty.component';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { StoreProductAmountComponent } from './store-product-amount/store-product-amount.component';
import { StoreOrderProductAmountComponent } from './store-order-product-amount/store-order-product-amount.component';
import { ConfirmationModalModule } from '@app/@shared/confirmation-modal/confirmation-modal.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StoreProductIsActiveComponent } from './store-product-is-active/store-product-is-active.component';

const COMPONENTS = [
	StoreProductImageComponent,
	StoreProductPriceComponent,
	StoreProductQtyComponent,
	StoreProductAmountComponent,
	StoreOrderProductAmountComponent,
	StoreProductIsActiveComponent,
];

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		NbSpinnerModule,
		ConfirmationModalModule,
		NbButtonModule,
		MatSlideToggleModule,
	],
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
})
export class StoreProductsTableModule {}
