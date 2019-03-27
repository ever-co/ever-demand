import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesModuleGuard } from 'pages/pages.module.guard';
import { InfoModuleGuard } from './info/info.module.guard';

const routes: Routes = [
	{
		path: 'info',
		loadChildren: './info/info.module#InfoPageModule',
		canLoad: [InfoModuleGuard]
	},
	{
		path: '',
		loadChildren: '../pages/pages.module#PagesModule',
		canLoad: [PagesModuleGuard]
	},
	{
		path: '**',
		pathMatch: 'full',
		redirectTo: ''
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
	providers: [PagesModuleGuard, InfoModuleGuard]
})
export class AppRoutingModule {}
