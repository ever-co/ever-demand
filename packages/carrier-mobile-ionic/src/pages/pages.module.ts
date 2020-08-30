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
		loadChildren: () =>
			import('./login/login.module').then((m) => m.LoginPageModule),
		canLoad: [LoginModuleGuard],
	},
	{
		path: 'main',
		loadChildren: () =>
			import('./main/main.module').then((m) => m.MainPageModule),
		canLoad: [AuthGuard, MainModuleGuard],
	},
	{
		path: 'product',
		loadChildren: () =>
			import('./product/product.module').then((m) => m.ProductModule),
		canLoad: [AuthGuard, ProductModuleGuard],
	},
	{
		path: 'deliveries',
		loadChildren: () =>
			import('./deliveries/deliveries.module').then(
				(m) => m.DeliveriesPageModule
			),
		canLoad: [AuthGuard],
	},
	{
		path: 'language',
		loadChildren: () =>
			import('./language/language.module').then(
				(m) => m.LanguagePageModule
			),
		canLoad: [AuthGuard],
	},
	{
		path: 'information',
		loadChildren: () =>
			import('./information/information.module').then(
				(m) => m.InformationModule
			),
		canLoad: [AuthGuard, InformationModuleGuard],
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login',
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	providers: [
		MainModuleGuard,
		LoginModuleGuard,
		ProductModuleGuard,
		InformationModuleGuard,
		AuthGuard,
	],
	exports: [RouterModule],
})
export class PagesModule {}
