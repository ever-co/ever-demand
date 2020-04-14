import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { ThemeModule } from '../../../@theme';
import { WarehouseComponent } from './warehouse.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { WarehouseProductCreateModule } from '../../../@shared/warehouse-product/warehouse-product-create';
import { WarehouseTableModule } from '../../../@shared/render-component/warehouse-table/warehouse-table.module';
import { WarehouseOrderModule } from './+warehouse-order/warehouse-order.module';
import { CustomerOrdersTableModule } from '../../../@shared/render-component/customer-orders-table/customer-orders-table.module';
import { JsonModalModule } from '../../../@shared/json-modal/json-modal.module';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { ProductsTableModule } from './products-table/products-table.module';
import { WarehouseProductsViewModule } from './+warehouse-products-view/warehouse-products-view.module';
import { WarehouseMainInfoViewModule } from './warehouse-main-info/warehouse-main-info.module';
import { WarehouseSelectViewModule } from './warehouse-select-view/warehouse-select-view.module';
import { WarehouseOrderViewModule } from './warehouse-order-view/warehouse-order-view.module';
import { WarehouseOrdersTableModule } from './warehouse-orders-table/warehouse-orders-table.module';

const routes: Routes = [
	{
		path: '',
		component: WarehouseComponent,
	},
	{
		path: 'manage',
		loadChildren: () =>
			import('./+warehouse-manage/warehouse-manage.module').then(
				(m) => m.WarehouseManageModule
			),
	},
];

@NgModule({
	imports: [
		CommonModule,
		ToasterModule.forRoot(),
		ThemeModule,
		Ng2SmartTableModule,
		WarehouseTableModule,
		TranslateModule.forChild({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		RouterModule.forChild(routes),
		WarehouseProductCreateModule,
		WarehouseOrderModule,
		CustomerOrdersTableModule,
		JsonModalModule,
		NbSpinnerModule,
		ProductsTableModule,
		WarehouseProductsViewModule,
		WarehouseMainInfoViewModule,
		WarehouseSelectViewModule,
		WarehouseOrderViewModule,
		WarehouseOrdersTableModule,
		NbButtonModule,
	],
	declarations: [WarehouseComponent],
})
export class WarehouseModule {
	public static routes = routes;
}

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
