import { RouterModule, Routes } from '@angular/router';
import { WarehousesComponent } from './warehouses.component';
import { NgModule } from '@angular/core';
import { WarehouseTrackComponent } from './+warehouse-track/warehouse-track.component';

const routes: Routes = [
	{
		path: '',
		component: WarehousesComponent,
	},
	{
		path: 'track',
		component: WarehouseTrackComponent,
	},
	{
		path: ':id',
		loadChildren: () =>
			import('./+warehouse/warehouse.module').then(
				(m) => m.WarehouseModule
			),
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class WarehousesRoutingModule {
	public static routes = routes;
}
