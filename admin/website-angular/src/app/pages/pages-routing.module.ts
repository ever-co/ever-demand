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
				pathMatch: 'full'
			},
			// {
			// 	path: '',
			// 	redirectTo: 'dashboard',
			// 	pathMatch: 'full'
			// },
			{
				path: 'sign-in-redirect',
				loadChildren:
					'./+sign-in-redirect/sign-in-redirect.module#SignInRedirectModule'
			},
			{
				path: 'dashboard',
				loadChildren: './+dashboard/dashboard.module#DashboardModule'
			},
			{
				path: 'simulation',
				loadChildren: './+simulation/simulation.module#SimulationModule'
			},
			{
				path: 'stores',
				loadChildren: './+warehouses/warehouses.module#WarehousesModule'
			},
			{
				path: 'carriers',
				loadChildren: './+carriers/carriers.module#CarriersModule'
			},
			{
				path: 'setup',
				loadChildren: './+setup/setup.module#SetupModule'
			},
			{
				path: 'generate-initial-data',
				loadChildren: './+fakeData/fakeData.module#FakeDataModule'
			},
			{
				path: 'devices',
				loadChildren: './+device/device.module#DeviceModule'
			},
			{
				path: 'customers',
				loadChildren: './+customers/customers.module#CustomersModule'
			},
			{
				path: 'orders',
				loadChildren: './+orders/orders.module#OrdersModule'
			},
			{
				path: 'products',
				loadChildren: './+products/products.module#ProductsModule'
			},
			{
				path: 'profile',
				loadChildren: './+profile/profile.module#ProfileModule'
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PagesRoutingModule {}
