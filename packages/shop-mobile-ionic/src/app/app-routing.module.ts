import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router, ExtraOptions } from '@angular/router';
import { PagesModuleGuard } from './pages/pages.module.guard';
import { MaintenanceModuleGuard } from './maintenance-info/maintenance-info.module.guard';
import { Store } from './services/store.service';

const routes: Routes = [
	{
		path: '',
		loadChildren: () =>
			import('./pages/pages.module').then((m) => m.PagesModule),
		canActivate: [PagesModuleGuard],
	},
	{
		path: 'maintenance-info',
		loadChildren: () =>
			import('./maintenance-info/maintenance-info.module').then(
				(m) => m.MaintenanceInfoPageModule
			),
		canActivate: [MaintenanceModuleGuard],
	},
	{
		path: 'server-down',
		loadChildren: () =>
			import('./+server-down/server-down.module').then(
				(m) => m.ServerDownPageModule
			),
	},
	{
		path: '**',
		pathMatch: 'full',
		redirectTo: '',
	},
];

const config: ExtraOptions = {
	useHash: true,
	enableTracing: true,
};

@NgModule({
	// imports: [RouterModule.forRoot(routes, config)],
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {
	constructor(private store: Store, private router: Router) {
		// const serverConnection = Number(this.store.serverConnection);
		// if (serverConnection === 0) {
		//  	this.router.navigate(['server-down']);
		// }
	}
}
