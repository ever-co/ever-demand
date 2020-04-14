import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';

const routes: Routes = [
	{
		path: '',
		component: PagesComponent,
		children: [
			{
				path: '',
				redirectTo: 'sign-in-redirect',
				pathMatch: 'full',
			},
			// {
			// 	path: '',
			// 	redirectTo: 'dashboard',
			// 	pathMatch: 'full'
			// },
			{
				path: 'sign-in-redirect',
				loadChildren: () =>
					import(
						'app/pages/+sign-in-redirect/sign-in-redirect.module'
					).then((m) => m.SignInRedirectModule),
			},
			{
				path: 'dashboard',
				loadChildren: () =>
					import('app/pages/+dashboard/dashboard.module').then(
						(m) => m.DashboardModule
					),
			},
			{
				path: 'simulation',
				loadChildren: () =>
					import('app/pages/+simulation/simulation.module').then(
						(m) => m.SimulationModule
					),
			},
			{
				path: 'stores',
				loadChildren: () =>
					import('app/pages/+warehouses/warehouses.module').then(
						(m) => m.WarehousesModule
					),
			},
			{
				path: 'carriers',
				loadChildren: () =>
					import('app/pages/+carriers/carriers.module').then(
						(m) => m.CarriersModule
					),
			},
			{
				path: 'setup',
				loadChildren: () =>
					import('app/pages/+setup/setup.module').then(
						(m) => m.SetupModule
					),
			},
			{
				path: 'generate-initial-data',
				loadChildren: () =>
					import('app/pages/+fakeData/fakeData.module').then(
						(m) => m.FakeDataModule
					),
			},
			{
				path: 'devices',
				loadChildren: () =>
					import('app/pages/+device/device.module').then(
						(m) => m.DeviceModule
					),
			},
			{
				path: 'customers',
				loadChildren: () =>
					import('app/pages/+customers/customers.module').then(
						(m) => m.CustomersModule
					),
			},
			{
				path: 'orders',
				loadChildren: () =>
					import('app/pages/+orders/orders.module').then(
						(m) => m.OrdersModule
					),
			},
			{
				path: 'products',
				loadChildren: () =>
					import('app/pages/+products/products.module').then(
						(m) => m.ProductsModule
					),
			},
			{
				path: 'profile',
				loadChildren: () =>
					import('app/pages/+profile/profile.module').then(
						(m) => m.ProfileModule
					),
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PagesRoutingModule {}
