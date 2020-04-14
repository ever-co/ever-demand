import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProductsPage } from './products.page';
import { TranslateModule } from '@ngx-translate/core';
import { ProductsSlidesViewComponent } from './products-view/slides-view/slides-view.component';
import { ProductsListViewComponent } from './products-view/list-view/list-view.component';
import { ProductsPageGuard } from './products.page.guard';
import { OrderModuleGuard } from './+order/order.module.guard';
import { WarehouseLogoModule } from '../../components/warehouse-logo/warehouse-logo.module';
import { ProductsViewComponent } from './products-view/products-view.component';
import { NgProgressModule } from '@ngx-progressbar/core';
import { OrderPageModule } from './+order/order.module';
import { CancelPageModule } from './+order/+cancel/cancel.module';
import { GeoLocationService } from '../../services/geo-location';
import { ProductsModule } from '../../components/products/products.module';
import { PipesModule } from '@modules/client.common.angular2/pipes/pipes.module';
import { OrderTakeawayInfoPopupModule } from './+order/takeaway/popup/popup.module';
import { CommonProducts } from './common/common-products.module';
import { GeoLocationProductsService } from 'app/services/geo-location/geo-location-products';
import { WarehouseProductsService } from 'app/services/merchants/warehouse-products';

const routes: Routes = [
	{
		path: '',
		component: ProductsPage,
		canActivate: [ProductsPageGuard],
		children: [
			{
				path: 'order',
				loadChildren: () =>
					import('./+order/order.module').then(
						(m) => m.OrderPageModule
					),
				canLoad: [OrderModuleGuard],
			},
		],
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		ProductsModule,
		NgProgressModule.withConfig({}),
		PipesModule,
		WarehouseLogoModule,
		OrderPageModule,
		CancelPageModule,
		OrderTakeawayInfoPopupModule,
		CommonProducts,
	],
	providers: [
		ProductsPageGuard,
		OrderModuleGuard,
		GeoLocationService,
		GeoLocationProductsService,
		WarehouseProductsService,
	],
	declarations: [
		ProductsPage,
		ProductsSlidesViewComponent,
		ProductsListViewComponent,
		ProductsViewComponent,
	],
})
export class ProductsPageModule {}
