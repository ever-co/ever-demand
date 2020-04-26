import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserLocationsPage } from './user-locations.page';

const routes: Routes = [
	{
		path: '',
		component: UserLocationsPage,
	},
	{
		path: 'new-address',
		loadChildren: () =>
			import('./new-address/new-address.module').then(
				(m) => m.NewAddressPageModule
			),
	},
	// {
	// 	path: 'new-location',
	// 	loadChildren: () => import('./new-location/new-location.module').then(m => m.NewLocationPageModule)
	// },
	//   {
	//     path: 'new-location',
	//     loadChildren: () => import('./new-location/new-location.module').then( m => m.NewLocationPageModule)
	//   }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class UserLocationsPageRoutingModule {}
