import { NgModule } from '@angular/core';
import { FormWizardModule } from '../../../components/form-wizard/form-wizard.module';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { CarrierDeletePopupPage } from './carrier-delete-popup';
import { IonicModule } from '@ionic/angular/lazy';
import { CommonModule } from '@angular/common';

@NgModule({
	declarations: [CarrierDeletePopupPage],
	entryComponents: [CarrierDeletePopupPage],
	imports: [
		FormWizardModule,
		Angular2SmartTableModule,
		FileUploadModule,
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		IonicModule,
		CommonModule,
		FormsModule,
	],
})
export class CarrierDeletePopupModule {}
