import { NgModule } from '@angular/core';
import { FormWizardModule } from 'angular2-wizard';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ConfirmDeletePopupPage } from './confirm-delete-popup';

@NgModule({
	declarations: [ConfirmDeletePopupPage],
	entryComponents: [ConfirmDeletePopupPage],
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
export class ConfirmDeletePopupModule {}
