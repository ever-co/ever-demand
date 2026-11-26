import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploadModule } from 'ng2-file-upload';
import { AccountFormComponent } from './account-form.component';
import { IonCheckbox, IonCol, IonInput, IonItem, IonRow } from '@ionic/angular';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FileUploadModule,
		TranslateModule.forChild(),
		FormsModule,
		IonCheckbox,
		IonCol,
		IonInput,
		IonItem,
		IonRow,
	],
	declarations: [AccountFormComponent],
	exports: [AccountFormComponent],
})
export class CarrierAccountFormsModule {}
