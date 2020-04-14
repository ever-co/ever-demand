import { NgModule } from '@angular/core';
import { AddCarriersPopupPage } from './add-carriers-popup';
import { FormWizardModule } from 'angular2-wizard';
import { AddChoiceComponent } from './add-choice/add-choice';
import { CarriersCatalogComponent } from './carriers-catalog/carriers-catalog';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AddressComponent } from './carriers-catalog/address.component';
import { TranslateModule } from '@ngx-translate/core';
import { AddNewCarriersPopupPageModule } from './add-new-carrier/add-new-carrier.module';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const COMPONENTS = [
	AddCarriersPopupPage,
	AddChoiceComponent,
	CarriersCatalogComponent,
	AddressComponent,
];

@NgModule({
	declarations: COMPONENTS,
	entryComponents: COMPONENTS,
	exports: COMPONENTS,
	imports: [
		IonicModule,
		CommonModule,
		FormsModule,
		FormWizardModule,
		Ng2SmartTableModule,
		AddNewCarriersPopupPageModule,
		TranslateModule.forChild(),
	],
})
export class AddCarriersPopupPageModule {}
