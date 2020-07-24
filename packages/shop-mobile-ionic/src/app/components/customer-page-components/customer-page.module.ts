import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HomeAddressComponent } from './home/home-address.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		IonicModule,
		TranslateModule.forChild(),
	],
	exports: [HomeAddressComponent],
	declarations: [HomeAddressComponent],
})
export class CustomerPageModule {}
