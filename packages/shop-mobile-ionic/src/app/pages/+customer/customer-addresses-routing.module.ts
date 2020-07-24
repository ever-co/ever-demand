import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerAddressesPage } from './customer-addresses.page';

const routes: Routes = [
	{
		path: '',
		component: CustomerAddressesPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class CustomerAddressesPageRoutingModule {}
