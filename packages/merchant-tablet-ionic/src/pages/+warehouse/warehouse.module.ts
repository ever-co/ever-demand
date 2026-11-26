import { NgModule } from '@angular/core';
import { WarehousePage } from './warehouse';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { OrderModule } from '../../components/order/order.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { AllOrdersComponent } from './all-oders/all-orders.component';
import { WarehouseOrdersService } from '../../services/warehouse-orders.service';
import { Store } from '../../services/store.service';
import { RelevantOrdersComponent } from './relevant-oders/relevant-orders.component';
import { WarehouseCommonModule } from './common/warehouse.common.module';
import { CommonModule } from '@angular/common';
import { AllProductsComponent } from './all-products/all-products.component';
import { TopProductsComponent } from './top-products/top-products.component';
import { WarehouseProductsService } from '../../services/warehouse-products.service';
import { NgxMasonryModule } from 'ngx-masonry';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { CreateProductTypePopupPageModule } from './create-product-type-popup/create-product-type-popup.module';
import { EditProductTypePopupPageModule } from './edit-product-type-popup/edit-product-type-popup.module';
import { WarehousesService } from '../../services/warehouses.service';
import { OrderStatusFilterPipe } from './warehouse.pipe';


const routes: Routes = [
	{
		path: '',
		component: WarehousePage,
	},
];

@NgModule({
	declarations: [
		WarehousePage,
		AllOrdersComponent,
		RelevantOrdersComponent,
		AllProductsComponent,
		TopProductsComponent,
		OrderStatusFilterPipe,
	],
	imports: [
		ComponentsModule,
		OrderModule,
		CommonModule,
		IonicModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		NgxPaginationModule,
		WarehouseCommonModule,
		NgxMasonryModule,
		CreateProductTypePopupPageModule,
		EditProductTypePopupPageModule,
	],
	providers: [
		WarehouseOrdersService,
		Store,
		WarehouseProductsService,
		WarehousesService,
	],
})
export class WarehousePageModule {}
