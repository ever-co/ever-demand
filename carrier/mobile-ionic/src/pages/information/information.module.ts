import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'about',
		loadChildren: './about/about.module#AboutPageModule'
	},
	{
		path: 'terms-of-use',
		loadChildren: './terms-of-use/terms-of-use.module#TermsOfUsePageModule'
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InformationModule {}
