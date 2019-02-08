import { RouterModule, Routes } from '@angular/router';
import { WarehousesComponent } from './warehouses.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
	{
		path: '',
		component: WarehousesComponent
	},
	{
		path: ':id',
		loadChildren: './+warehouse/warehouse.module#WarehouseModule'
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class WarehousesRoutingModule {
	public static routes = routes;
}
