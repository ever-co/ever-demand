import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewAddressPage } from './new-address.page';

const routes: Routes = [
	{
		path: '',
		component: NewAddressPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class NewAddressPageRoutingModule {}
