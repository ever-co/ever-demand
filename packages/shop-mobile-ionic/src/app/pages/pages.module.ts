import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsModuleGuard } from './+products/products.module.guard';
import { InviteModuleGuard } from './+invite/invite.module.guard';
import { InfoModuleGuard } from './+info/info.module.guard';
import { MaintenanceService } from '@modules/client.common.angular2/services/maintenance.service';
import { OrderTakeawayInfoModuleGuard } from './+products/+order/takeaway/+page/takeaway-page.module.guard';
import { OrderInfoPageModuleGuard } from './+products/+order/+order-info/order-info.module.guard';
import { OrdersHistoryModuleGuard } from './+orders-history/orders-history.module.guard';
import { MerchantsPageModuleGuard } from './+merchants/merchants.module.guard';

const routes: Routes = [
	{
		path: 'products',
		loadChildren: './+products/products.module#ProductsPageModule',
		canLoad: [ProductsModuleGuard]
	},
	{
		path: 'products/product-details/:id',
		loadChildren:
			'./+products/product-details/product-details.module#ProductDetailsPageModule'
		// canLoad: [ ProductsModuleGuard ]
	},
	{
		path: 'orders-history',
		loadChildren:
			'./+orders-history/orders-history.module#OrdersHistoryPageModule',
		canLoad: [OrdersHistoryModuleGuard]
	},
	{
		path: 'invite',
		loadChildren: './+invite/invite.module#InvitePageModule',
		canLoad: [InviteModuleGuard]
	},
	{
		path: 'info',
		loadChildren: './+info/info.module#InfoModule',
		canLoad: [InfoModuleGuard]
	},
	{
		path: 'language',
		loadChildren: './+language/language.module#LanguagePageModule'
	},
	{
		path: 'errors',
		loadChildren: './+errors/errors.module#ErrorsModule'
	},
	{
		path: 'order-info',
		loadChildren:
			'./+products/+order/+order-info/order-info.module#OrderInfoPageModule',
		canLoad: [OrderInfoPageModuleGuard]
	},
	{
		path: 'order-info-takeaway',
		loadChildren:
			'./+products/+order/takeaway/+page/takeaway-page.module#OrderTakeawayInfoPageModule',
		canLoad: [OrderTakeawayInfoModuleGuard]
	},
	{
		path: 'merchants',
		loadChildren: './+merchants/merchants.module#MerchantsPageModule',
		canLoad: [MerchantsPageModuleGuard]
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'invite'
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	providers: [
		ProductsModuleGuard,
		InviteModuleGuard,
		InfoModuleGuard,
		MaintenanceService,
		OrderTakeawayInfoModuleGuard,
		OrderInfoPageModuleGuard,
		OrdersHistoryModuleGuard,
		MerchantsPageModuleGuard
	],
	exports: [RouterModule]
})
export class PagesModule {}
