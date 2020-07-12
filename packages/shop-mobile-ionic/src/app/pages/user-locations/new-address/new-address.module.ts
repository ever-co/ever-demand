import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewAddressPageRoutingModule } from './new-address-routing.module';

import { NewAddressPage } from './new-address.page';

import { GeoLocationService } from '../../../services/geo-location';
//import { Geolocation } from '@ionic-native/geolocation/ngx';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
		NewAddressPageRoutingModule,
	],
	providers: [GeoLocationService],
	declarations: [NewAddressPage],
})
export class NewAddressPageModule {}
