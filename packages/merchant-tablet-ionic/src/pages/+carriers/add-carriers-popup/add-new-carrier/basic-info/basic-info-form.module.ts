import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { BasicInfoFormComponent } from './basic-info-form.component';
import {
	IonCol,
	IonGrid,
	IonIcon,
	IonInput,
	IonItem,
	IonRow,
} from '@ionic/angular';
import { FileUploaderModule } from '../../../../../components/file-uploader/file-uploader.module';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		FormsModule,
		FileUploaderModule,
		IonCol,
		IonGrid,
		IonIcon,
		IonInput,
		IonItem,
		IonRow,
	],
	declarations: [BasicInfoFormComponent],
	exports: [BasicInfoFormComponent],
})
export class CarrierBasicFormsModule {}
