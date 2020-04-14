import { NgModule } from '@angular/core';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { PagesModuleGuard } from 'pages/pages.module.guard';
import { InfoModuleGuard } from './info/info.module.guard';

const routes: Routes = [
	{
		path: 'info',
		loadChildren: () =>
			import('./info/info.module').then((m) => m.InfoPageModule),
		canLoad: [InfoModuleGuard],
	},
	{
		path: '',
		loadChildren: () =>
			import('../pages/pages.module').then((m) => m.PagesModule),
		canLoad: [PagesModuleGuard],
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
	providers: [PagesModuleGuard, InfoModuleGuard],
})
export class AppRoutingModule {}
