import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainModuleGuard } from './main/main.module.guard';
import { LoginModuleGuard } from './login/login.module.guard';
import { ProductModuleGuard } from './product/product.module.guard';
import { InformationModuleGuard } from './information/information.module.guard';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
	{
		path: 'login',
		loadChildren: './login/login.module#LoginPageModule',
		canLoad: [LoginModuleGuard]
	},
	{
		path: 'main',
		loadChildren: './main/main.module#MainPageModule',
		canLoad: [AuthGuard, MainModuleGuard]
	},
	{
		path: 'product',
		loadChildren: './product/product.module#ProductModule',
		canLoad: [AuthGuard, ProductModuleGuard]
	},
	{
		path: 'deliveries',
		loadChildren: './deliveries/deliveries.module#DeliveriesPageModule',
		canLoad: [AuthGuard]
	},
	{
		path: 'language',
		loadChildren: './language/language.module#LanguagePageModule',
		canLoad: [AuthGuard]
	},
	{
		path: 'information',
		loadChildren: './information/information.module#InformationModule',
		canLoad: [AuthGuard, InformationModuleGuard]
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login'
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	providers: [
		MainModuleGuard,
		LoginModuleGuard,
		ProductModuleGuard,
		InformationModuleGuard,
		AuthGuard
	],
	exports: [RouterModule]
})
export class PagesModule {}
