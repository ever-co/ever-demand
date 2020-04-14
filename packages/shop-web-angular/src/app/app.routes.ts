import { Routes } from '@angular/router';
import { NoContentComponent } from './no-content';
import { LoginModuleGuard } from './+login/login.module.guard';
import { ProductsModuleGuard } from './+products/products.module.guard';
import { AppModuleGuard } from './app.module.guard';
import { MaintenanceModuleGuard } from './+maintenance-info/maintenance-info.module.guard';
import { AuthGuard } from './authentication/auth.guard';

export const ROUTES: Routes = [
	{
		path: '',
		children: [
			{
				path: '',
				redirectTo: '/login',
				pathMatch: 'full',
			},
			{
				path: 'login',
				loadChildren: () =>
					import('./+login').then((m) => m.LoginModule),
				canActivate: [LoginModuleGuard],
			},
			{
				path: 'products',
				loadChildren: () =>
					import('./+products').then((m) => m.ProductsModule),
				canActivate: [ProductsModuleGuard, AuthGuard],
			},
			{
				path: 'orders',
				loadChildren: () =>
					import('./+orders').then((m) => m.OrdersModule),
				canActivate: [AuthGuard],
			},
			{
				path: 'settings',
				loadChildren: () =>
					import('./+settings').then((m) => m.SettingsModule),
				canActivate: [AuthGuard],
			},
		],
		canActivate: [AppModuleGuard],
	},
	{
		path: 'maintenance-info',
		loadChildren: () =>
			import('./+maintenance-info/maintenance-info.module').then(
				(m) => m.MaintenanceInfoModule
			),
		canActivate: [MaintenanceModuleGuard],
	},
	{
		path: 'server-down',
		loadChildren: () =>
			import('./+server-down/server-down.module').then(
				(m) => m.ServerDownModule
			),
	},
	{
		path: '**',
		component: NoContentComponent,
	},
];
