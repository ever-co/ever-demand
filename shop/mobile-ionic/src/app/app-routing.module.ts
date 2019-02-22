import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesModuleGuard } from './pages/pages.module.guard';
import { MaintenanceModuleGuard } from './maintenance-info/maintenance-info.module.guard';

const routes: Routes = [
	{
		path: '',
		loadChildren: './pages/pages.module#PagesModule',
		canActivate: [PagesModuleGuard]
	},
	{
		path: 'maintenance-info',
		loadChildren:
			'./maintenance-info/maintenance-info.module#MaintenanceInfoPageModule',
		canActivate: [MaintenanceModuleGuard]
	},
	{
		path: '**',
		pathMatch: 'full',
		redirectTo: ''
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
