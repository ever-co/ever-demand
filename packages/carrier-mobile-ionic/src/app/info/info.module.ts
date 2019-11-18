import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { MaintenanceModuleGuard } from './maintenance-info/maintenance.module.guard';
import { ServerDownModuleGuard } from './no-server-connection/no-server.module.guard';
import { NoInternetModuleGuard } from './no-internet/no-internet.modue.guard';

const routes: Routes = [
	{
		path: 'maintenance',
		loadChildren:
			'./maintenance-info/maintenance-info.module#MaintenanceInfoPageModule',
		canLoad: [MaintenanceModuleGuard]
	},
	{
		path: 'server-down',
		loadChildren:
			'./no-server-connection/no-server.module#ServerDownModule',
		canLoad: [ServerDownModuleGuard]
	},
	{
		path: 'no-internet',
		loadChildren: './no-internet/no-internet.module#NoInternerModule',
		canLoad: [NoInternetModuleGuard]
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'maintenance'
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	providers: [
		MaintenanceModuleGuard,
		ServerDownModuleGuard,
		NoInternetModuleGuard
	]
})
export class InfoPageModule {}
