import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{
		path: 'get',
		loadChildren: './get-product/get-product.module#GetProductPageModule'
	},
	{
		path: 'return',
		loadChildren:
			'./return-product/return-product.module#ReturnProductPageModule'
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'get'
	}
];

@NgModule({
	imports: [TranslateModule.forChild(), RouterModule.forChild(routes)]
})
export class ProductModule {}
