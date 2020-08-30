import { NgModule } from '@angular/core';
import { FormWizardModule } from 'angular2-wizard';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { CarrierBasicFormsModule } from './basic-info/basic-info-form.module';
import { CarrierAccountFormsModule } from './account/account-form.module';
import { CarrierLocationFormsModule } from './location/location-form.module';
import { GoogleMapModule } from '../../../@shared/google-map/google-map.module';
import { CarrierEditPopupPage } from './carrier-edit-popup';
import { CarrierService } from '../../../services/carrier.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@NgModule({
	declarations: [CarrierEditPopupPage],
	entryComponents: [CarrierEditPopupPage],
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
	],
	providers: [CarrierService],
})
export class CarrierEditPopupModule {}
