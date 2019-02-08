import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CarriersComponent } from './carriers.component';

const routes: Routes = [
	{
		path: '',
		component: CarriersComponent
	},
	{
		path: ':id',
		loadChildren: './+carrier/carrier.module#CarrierModule'
	}
];

@NgModule({
	imports: [ RouterModule.forChild(routes) ],
	exports: [ RouterModule ]
})
export class CarriersRoutingModule {
	public static routes = routes;
}
