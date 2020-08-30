import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CarriersComponent } from './carriers.component';
import { TrackComponent } from './track/track.component';

const routes: Routes = [
	{
		path: '',
		component: CarriersComponent,
	},
	{
		path: 'track',
		component: TrackComponent,
	},
	{
		path: 'track/:storeId',
		component: TrackComponent,
	},
	{
		path: 'track/:storeId/:carrierId',
		component: TrackComponent,
	},
	{
		path: ':id',
		loadChildren: () =>
			import('./+carrier/carrier.module').then((m) => m.CarrierModule),
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class CarriersRoutingModule {
	public static routes = routes;
}
