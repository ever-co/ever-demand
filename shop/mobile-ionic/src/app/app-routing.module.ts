import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router, ExtraOptions } from '@angular/router';
import { PagesModuleGuard } from './pages/pages.module.guard';
import { MaintenanceModuleGuard } from './maintenance-info/maintenance-info.module.guard';
import { Store } from './services/store.service';

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
		path: 'server-down',
		loadChildren: './+server-down/server-down.module#ServerDownPageModule'
	},
	{
		path: '**',
		pathMatch: 'full',
		redirectTo: ''
	}
];

const config: ExtraOptions = {
	useHash: true,
	enableTracing: true
};

@NgModule({
	imports: [RouterModule.forRoot(routes, config)],
	exports: [RouterModule]
})
export class AppRoutingModule {
	constructor(private store: Store, private router: Router) {
		const serverConnection = Number(this.store.serverConnection);

		if (serverConnection === 0) {
			this.router.navigate(['server-down']);
		}
	}
}
