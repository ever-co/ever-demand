import { NgModule } from '@angular/core';
import { FormWizardModule } from '../../../../components/form-wizard/form-wizard.module';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { AddNewCarrierComponent } from './add-new-carrier';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { CarrierBasicFormsModule } from './basic-info/basic-info-form.module';
import { CarrierAccountFormsModule } from './account/account-form.module';
import { CarrierLocationFormsModule } from './location/location-form.module';
import { GoogleMapModule } from '../../../../@shared/google-map/google-map.module';
import { IonicModule } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [AddNewCarrierComponent],
    exports: [AddNewCarrierComponent],
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
        IonicModule,
        CommonModule,
        FormsModule,
    ]
})
export class AddNewCarriersPopupPageModule {}
