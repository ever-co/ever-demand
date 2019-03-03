import { Routes } from '@angular/router';
import { NoContentComponent } from './no-content';
import { LoginModuleGuard } from './+login/login.module.guard';
import { ProductsModuleGuard } from './+products/products.module.guard';
import { AppModuleGuard } from './app.module.guard';
import { MaintenanceModuleGuard } from './+maintenance-info/maintenance-info.module.guard';

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
				canActivate: [ProductsModuleGuard]
			},
			{
				path: 'orders',
				loadChildren: './+orders#OrdersModule'
			},
			{
				path: 'settings',
				loadChildren: './+settings#SettingsModule'
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
		path: '**',
		component: NoContentComponent
	}
];
