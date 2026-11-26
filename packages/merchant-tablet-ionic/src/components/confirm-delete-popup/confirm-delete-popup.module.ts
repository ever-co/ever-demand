import { NgModule } from '@angular/core';
import { FormWizardModule } from '../form-wizard/form-wizard.module';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { IonButton, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ConfirmDeletePopupPage } from './confirm-delete-popup';

@NgModule({
    declarations: [ConfirmDeletePopupPage],
    imports: [
        FormWizardModule,
        Angular2SmartTableModule,
        FileUploadModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild(),
        CommonModule,
        FormsModule,
        IonButton,
    ],
    providers: [ModalController]
})
export class ConfirmDeletePopupModule {}
