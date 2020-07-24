import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomerAddressesPageRoutingModule } from './customer-addresses-routing.module';

import { CustomerAddressesPage } from './customer-addresses.page';
import { GeoLocationService } from 'app/services/geo-location';
import { TranslateModule } from '@ngx-translate/core';
import { CustomerPageModule } from 'app/components/customer-page-components/customer-page.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		CustomerPageModule,
		IonicModule,
		CustomerAddressesPageRoutingModule,
		TranslateModule.forChild(),
	],
	providers: [GeoLocationService],
	declarations: [CustomerAddressesPage],
})
export class CustomerAddressesModule {}
