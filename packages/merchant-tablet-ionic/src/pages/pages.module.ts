import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginModuleGuard } from './+login/login.module.guard';
import { WarehouseModuleGuard } from './+warehouse/warehouse.module.guard';
import { InfoModuleGuard } from './+info/info.module.guard';

// TODO: add all routes!
const routes: Routes = [
	{
		path: 'login',
		loadChildren: () =>
			import('./+login/login.module').then((m) => m.LoginPageModule),
		canLoad: [LoginModuleGuard],
	},
	{
		path: 'warehouse',
		loadChildren: () =>
			import('./+warehouse/warehouse.module').then(
				(m) => m.WarehousePageModule
			),
		canLoad: [WarehouseModuleGuard],
	},
	{
		path: 'language',
		loadChildren: () =>
			import('./+language/language.module').then(
				(m) => m.LanguagePageModule
			),
	},
	{
		path: 'customers',
		loadChildren: () =>
			import('./+customers/customers.module').then(
				(m) => m.CustomersPageModule
			),
	},
	{
		path: 'carriers',
		loadChildren: () =>
			import('./+carriers/carriers.module').then(
				(m) => m.CarrierssPageModule
			),
	},
	{
		path: 'track',
		loadChildren: () =>
			import('./+track/track.module').then((m) => m.TrackPageModule),
	},
	{
		path: 'track/:id',
		loadChildren: () =>
			import('./+track/track.module').then((m) => m.TrackPageModule),
	},
	{
		path: 'settings',
		loadChildren: () =>
			import('./+settings/settings.module').then(
				(m) => m.SettingsPageModule
			),
	},
	{
		path: 'info',
		loadChildren: () =>
			import('./+info/info.module').then((m) => m.InfoModule),
		canLoad: [InfoModuleGuard],
	},
	{
		path: 'errors',
		loadChildren: () =>
			import('./+errors/errors.module').then((m) => m.ErrorsModule),
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login',
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	providers: [LoginModuleGuard, WarehouseModuleGuard, InfoModuleGuard],
	exports: [RouterModule],
})
export class PagesModule {}
