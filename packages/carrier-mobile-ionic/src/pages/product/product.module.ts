import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: 'get',
		loadChildren: () =>
			import('./get-product/get-product.module').then(
				(m) => m.GetProductPageModule
			),
	},
	{
		path: 'return',
		loadChildren: () =>
			import('./return-product/return-product.module').then(
				(m) => m.ReturnProductPageModule
			),
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'get',
	},
];

@NgModule({
	imports: [TranslateModule.forChild(), RouterModule.forChild(routes)],
})
export class ProductModule {}
