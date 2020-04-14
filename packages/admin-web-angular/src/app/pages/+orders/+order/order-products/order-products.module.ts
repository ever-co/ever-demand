import { NgModule } from '@angular/core';
import { ThemeModule } from '@app/@theme';
import { ToasterModule } from 'angular2-toaster';
import { CommonModule } from '@angular/common';
import { OrderProductsComponent } from './order-products.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { RenderComponentsModule } from '@app/@shared/render-component/render-components.module';
import { StoreProductsTableModule } from '@app/@shared/render-component/store-products-table/store-products-table.module';
import { WarehouseOrderModalModule } from '@app/@shared/warehouse/+warehouse-order-modal/warehouse-order-modal.module';
import { TranslateModule } from '@ngx-translate/core';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { ConfirmationModalModule } from '@app/@shared/confirmation-modal/confirmation-modal.module';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		ToasterModule.forRoot(),
		Ng2SmartTableModule,
		TranslateModule.forChild(),
		RenderComponentsModule,
		StoreProductsTableModule,
		WarehouseOrderModalModule,
		NbSpinnerModule,
		ConfirmationModalModule,
		NbButtonModule,
	],
	declarations: [OrderProductsComponent],
	exports: [OrderProductsComponent],
})
export class OrderProductsModule {}
