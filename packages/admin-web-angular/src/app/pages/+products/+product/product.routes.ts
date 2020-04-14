import { Routes } from '@angular/router';
import { ProductComponent } from './product.component';

export const routes: Routes = [
	{
		path: '',
		component: ProductComponent,
	},
	{
		path: 'edit',
		loadChildren: () =>
			import('./product-edit/product-edit.module').then(
				(m) => m.ProductEditModule
			),
	},
];
