import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UserLocationsPage } from './user-locations.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';

const routes: Routes = [
	{
		path: '',
		component: UserLocationsPage
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes)
	],
	declarations: [UserLocationsPage],
	providers: [Geolocation]
})
export class UserLocationsPageModule { }
