import { NgModule } from '@angular/core';
import { FormWizardModule } from 'angular2-wizard';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { AddNewCarrierComponent } from './add-new-carrier';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { CarrierBasicFormsModule } from './basic-info/basic-info-form.module';
import { CarrierAccountFormsModule } from './account/account-form.module';
import { CarrierLocationFormsModule } from './location/location-form.module';
import { GoogleMapModule } from '../../../../@shared/google-map/google-map.module';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@NgModule({
	declarations: [AddNewCarrierComponent],
	entryComponents: [AddNewCarrierComponent],
	exports: [AddNewCarrierComponent],
	imports: [
		FormWizardModule,
		Ng2SmartTableModule,
		FileUploadModule,
		FormsModule,
		ReactiveFormsModule,
		CarrierBasicFormsModule,
		CarrierAccountFormsModule,
		CarrierLocationFormsModule,
		GoogleMapModule,
		TranslateModule.forChild(),
		IonicModule,
		CommonModule,
		FormsModule,
	],
})
export class AddNewCarriersPopupPageModule {}
