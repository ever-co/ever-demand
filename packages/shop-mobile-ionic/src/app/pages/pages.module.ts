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
		loadChildren: () =>
			import('./+products/products.module').then(
				(m) => m.ProductsPageModule
			),
		canLoad: [ProductsModuleGuard],
	},
	{
		path: 'products/product-details/:id',
		loadChildren: () =>
			import('./+products/product-details/product-details.module').then(
				(m) => m.ProductDetailsPageModule
			),
		// canLoad: [ ProductsModuleGuard ]
	},
	{
		path: 'orders-history',
		loadChildren: () =>
			import('./+orders-history/orders-history.module').then(
				(m) => m.OrdersHistoryPageModule
			),
		canLoad: [OrdersHistoryModuleGuard],
	},
	{
		path: 'invite',
		loadChildren: () =>
			import('./+invite/invite.module').then((m) => m.InvitePageModule),
		canLoad: [InviteModuleGuard],
	},
	{
		path: 'info',
		loadChildren: () =>
			import('./+info/info.module').then((m) => m.InfoModule),
		canLoad: [InfoModuleGuard],
	},
	{
		path: 'language',
		loadChildren: () =>
			import('./+language/language.module').then(
				(m) => m.LanguagePageModule
			),
	},
	{
		path: 'errors',
		loadChildren: () =>
			import('./+errors/errors.module').then((m) => m.ErrorsModule),
	},
	{
		path: 'order-info',
		loadChildren: () =>
			import('./+products/+order/+order-info/order-info.module').then(
				(m) => m.OrderInfoPageModule
			),
		canLoad: [OrderInfoPageModuleGuard],
	},
	{
		path: 'order-info-takeaway',
		loadChildren: () =>
			import(
				'./+products/+order/takeaway/+page/takeaway-page.module'
			).then((m) => m.OrderTakeawayInfoPageModule),
		canLoad: [OrderTakeawayInfoModuleGuard],
	},
	{
		path: 'merchants',
		loadChildren: () =>
			import('./+merchants/merchants.module').then(
				(m) => m.MerchantsPageModule
			),
		canLoad: [MerchantsPageModuleGuard],
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'invite',
	},
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
		MerchantsPageModuleGuard,
	],
	exports: [RouterModule],
})
export class PagesModule {}
