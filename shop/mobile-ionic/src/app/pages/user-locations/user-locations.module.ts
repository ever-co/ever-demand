import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UserLocationsPage } from './user-locations.page';

const routes: Routes = [
	{ path: 'current', loadChildren: './pages/user-locations/current-addresses/current-addresses.module#CurrentAddressesPageModule' },
	{ path: 'new', loadChildren: './pages/user-locations/new-address/new-address.module#NewAddressPageModule' },
	{ path: '**', redirectTo: 'current', pathMatch: 'full' },
];

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		RouterModule.forChild(routes),
	],
	declarations: [UserLocationsPage],
})
export class UserLocationsPageModule { }
