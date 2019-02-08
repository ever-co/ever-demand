import { Routes } from '@angular/router';
import { ProductComponent } from './product.component';

export const routes: Routes = [
	{
		path: '',
		component: ProductComponent
	},
	{
		path: 'edit',
		loadChildren: './product-edit/product-edit.module#ProductEditModule'
	}
];
