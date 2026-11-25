import { NgModule } from '@angular/core';
import { AddCarriersPopupPage } from './add-carriers-popup';
import { FormWizardModule } from '../../../components/form-wizard/form-wizard.module';
import { AddChoiceComponent } from './add-choice/add-choice';
import { CarriersCatalogComponent } from './carriers-catalog/carriers-catalog';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { AddressComponent } from './carriers-catalog/address.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { AddNewCarriersPopupPageModule } from './add-new-carrier/add-new-carrier.module';
import { IonicModule } from '@ionic/angular/lazy';
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
    exports: COMPONENTS,
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        FormWizardModule,
        Angular2SmartTableModule,
        AddNewCarriersPopupPageModule,
        TranslateModule.forChild(),
    ]
})
export class AddCarriersPopupPageModule {}
