import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MaintenanceModuleGuard } from './maintenance-info/maintenance.module.guard';
import { ServerDownModuleGuard } from './no-server-connection/no-server.module.guard';
import { NoInternetModuleGuard } from './no-internet/no-internet.modue.guard';

const routes: Routes = [
	{
		path: 'maintenance',
		loadChildren: () =>
			import('./maintenance-info/maintenance-info.module').then(
				(m) => m.MaintenanceInfoPageModule
			),
		canLoad: [MaintenanceModuleGuard],
	},
	{
		path: 'server-down',
		loadChildren: () =>
			import('./no-server-connection/no-server.module').then(
				(m) => m.ServerDownModule
			),
		canLoad: [ServerDownModuleGuard],
	},
	{
		path: 'no-internet',
		loadChildren: () =>
			import('./no-internet/no-internet.module').then(
				(m) => m.NoInternerModule
			),
		canLoad: [NoInternetModuleGuard],
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'maintenance',
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	providers: [
		MaintenanceModuleGuard,
		ServerDownModuleGuard,
		NoInternetModuleGuard,
	],
})
export class InfoPageModule {}
