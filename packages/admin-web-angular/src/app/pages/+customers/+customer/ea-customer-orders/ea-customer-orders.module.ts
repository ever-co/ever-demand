import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { HighlightModule } from 'ngx-highlightjs';
import { ThemeModule } from '@app/@theme';
import { RenderComponentsModule } from '@app/@shared/render-component/render-components.module';
import { OrderInfoComponent } from './order-info/order-info.component';
import { OrderCancelComponent } from './order-cancel/order-cancel.component';
import { CustomOrderComponent } from '../ea-customer-products/custom-order';
import { CustomerOrdersTableModule } from '@app/@shared/render-component/customer-orders-table/customer-orders-table.module';
import { CustomerOrdersComponent } from './ea-customer-orders.component';

@NgModule({
	imports: [
		CommonModule,
		Ng2SmartTableModule,
		ThemeModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild(),
		HighlightModule.forRoot({ theme: 'github' }),
		RenderComponentsModule,
		CustomerOrdersTableModule,
	],
	declarations: [
		OrderInfoComponent,
		OrderCancelComponent,
		CustomerOrdersComponent,
		CustomOrderComponent,
	],
	entryComponents: [
		OrderInfoComponent,
		OrderCancelComponent,
		CustomOrderComponent,
	],
	exports: [CustomerOrdersComponent],
})
export class CustomerOrdersModule {}
