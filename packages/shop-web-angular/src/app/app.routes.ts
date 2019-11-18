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
				pathMatch: 'full'
			},
			{
				path: 'login',
				loadChildren: './+login#LoginModule',
				canActivate: [LoginModuleGuard]
			},
			{
				path: 'products',
				loadChildren: './+products#ProductsModule',
				canActivate: [ProductsModuleGuard, AuthGuard]
			},
			{
				path: 'orders',
				loadChildren: './+orders#OrdersModule',
				canActivate: [AuthGuard]
			},
			{
				path: 'settings',
				loadChildren: './+settings#SettingsModule',
				canActivate: [AuthGuard]
			}
		],
		canActivate: [AppModuleGuard]
	},
	{
		path: 'maintenance-info',
		loadChildren:
			'./+maintenance-info/maintenance-info.module#MaintenanceInfoModule',
		canActivate: [MaintenanceModuleGuard]
	},
	{
		path: 'server-down',
		loadChildren: './+server-down/server-down.module#ServerDownModule'
	},
	{
		path: '**',
		component: NoContentComponent
	}
];
