import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserLocationsPageRoutingModule } from './user-locations-routing.module';
import { UserLocationsPage } from './user-locations.page';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: UserLocationsPage,
	},
	{
		path: 'new',
		loadChildren: () =>
			import('./new-address/new-address.module').then(
				(m) => m.NewAddressPageModule
			),
	},
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
		UserLocationsPageRoutingModule,
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
	],
	declarations: [UserLocationsPage],
})
export class UserLocationsPageModule {}
