import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'about',
		loadChildren: () =>
			import('./about/about.module').then((m) => m.AboutPageModule),
	},
	{
		path: 'terms-of-use',
		loadChildren: () =>
			import('./terms-of-use/terms-of-use.module').then(
				(m) => m.TermsOfUsePageModule
			),
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class InformationModule {}
