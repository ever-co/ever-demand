import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginModuleGuard } from './+login/login.module.guard';
import { WarehouseModuleGuard } from './+warehouse/warehouse.module.guard';
import { InfoModuleGuard } from './+info/info.module.guard';

// TODO: add all routes!
const routes: Routes = [
	{
		path: 'login',
		loadChildren: './+login/login.module#LoginPageModule',
		canLoad: [LoginModuleGuard]
	},
	{
		path: 'warehouse',
		loadChildren: './+warehouse/warehouse.module#WarehousePageModule',
		canLoad: [WarehouseModuleGuard]
	},
	{
		path: 'language',
		loadChildren: './+language/language.module#LanguagePageModule'
	},
	{
		path: 'customers',
		loadChildren: './+customers/customers.module#CustomersPageModule'
	},
	{
		path: 'carriers',
		loadChildren: './+carriers/carriers.module#CarrierssPageModule'
	},
	{
		path: 'track',
		loadChildren: './+track/track.module#TrackPageModule'
	},
	{
		path: 'track/:id',
		loadChildren: './+track/track.module#TrackPageModule'
	},
	{
		path: 'settings',
		loadChildren: './+settings/settings.module#SettingsPageModule'
	},
	{
		path: 'info',
		loadChildren: './+info/info.module#InfoModule',
		canLoad: [InfoModuleGuard]
	},
	{
		path: 'errors',
		loadChildren: './+errors/errors.module#ErrorsModule'
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login'
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	providers: [LoginModuleGuard, WarehouseModuleGuard, InfoModuleGuard],
	exports: [RouterModule]
})
export class PagesModule {}
