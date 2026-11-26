import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploadModule } from 'ng2-file-upload';
import { AccountFormComponent } from './account-form.component';
import { IonCheckbox } from '@ionic/angular/ion-checkbox';
import { IonCol } from '@ionic/angular/ion-col';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonRow } from '@ionic/angular/ion-row';

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
