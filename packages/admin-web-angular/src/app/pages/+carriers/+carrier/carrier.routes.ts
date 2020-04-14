import { Routes } from '@angular/router';
import { CarrierComponent } from './carrier.component';

export const routes: Routes = [
	{
		path: '',
		component: CarrierComponent,
	},
	{
		path: 'edit',
		loadChildren: () =>
			import('./+carrier-edit/carrier-edit.module').then(
				(m) => m.CarrierEditModule
			),
	},
];
