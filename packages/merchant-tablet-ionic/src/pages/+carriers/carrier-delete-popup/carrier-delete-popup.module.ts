import { NgModule } from '@angular/core';
import { FormWizardModule } from 'angular2-wizard';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { CarrierDeletePopupPage } from './carrier-delete-popup';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@NgModule({
	declarations: [CarrierDeletePopupPage],
	entryComponents: [CarrierDeletePopupPage],
	imports: [
		FormWizardModule,
		Ng2SmartTableModule,
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
