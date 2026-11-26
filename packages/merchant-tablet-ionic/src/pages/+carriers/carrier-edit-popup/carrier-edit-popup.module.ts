import { NgModule } from '@angular/core';
import { FormWizardModule } from '../../../components/form-wizard/form-wizard.module';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { CarrierBasicFormsModule } from './basic-info/basic-info-form.module';
import { CarrierAccountFormsModule } from './account/account-form.module';
import { CarrierLocationFormsModule } from './location/location-form.module';
import { GoogleMapModule } from '../../../@shared/google-map/google-map.module';
import { CarrierEditPopupPage } from './carrier-edit-popup';
import { CarrierService } from '../../../services/carrier.service';
import {
	IonButton,
	IonCol,
	IonGrid,
	IonRow,
	ModalController,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [CarrierEditPopupPage],
    imports: [
        FormWizardModule,
        Angular2SmartTableModule,
        FileUploadModule,
        FormsModule,
        ReactiveFormsModule,
        CarrierBasicFormsModule,
        CarrierAccountFormsModule,
        CarrierLocationFormsModule,
        GoogleMapModule,
        TranslateModule.forChild(),
        CommonModule,
        IonButton,
        IonCol,
        IonGrid,
        IonRow,
    ],
    providers: [CarrierService, ModalController]
})
export class CarrierEditPopupModule {}
