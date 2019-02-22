import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: 'about',
		loadChildren: './+about/about.module#AboutPageModule'
	},
	{
		path: 'help',
		loadChildren: './+help/help.module#HelpPageModule'
	},
	{
		path: 'terms-of-use',
		loadChildren: './+terms-of-use/terms-of-use.module#TermsOfUsePageModule'
	},
	{
		path: 'privacy',
		loadChildren: './+privacy/privacy.module#PrivacyPageModule'
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InfoModule {}
