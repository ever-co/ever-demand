import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NewAddressPage } from './new-address.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';

const routes: Routes = [
	{
		path: '',
		component: NewAddressPage
	}
];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		RouterModule.forChild(routes),
		ReactiveFormsModule
	],
	declarations: [NewAddressPage],
	providers: [Geolocation]
})
export class NewAddressPageModule { }
