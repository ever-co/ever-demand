import { NgModule } from '@angular/core';
import { BasicInfoFormComponent } from './basic-info/basic-info-form.component';
import { DetailsInfoFormComponent } from './details-info/details-info-form.component';
import {
	IonCheckbox,
	IonCol,
	IonDatetime,
	IonDatetimeButton,
	IonGrid,
	IonImg,
	IonInput,
	IonItem,
	IonLabel,
	IonModal,
	IonRow,
	IonSelect,
	IonSelectOption,
	IonTextarea,
	IonThumbnail,
} from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploaderModule } from '../../../components/file-uploader/file-uploader.module';
import { CommonModule } from '@angular/common';

const COMPONENTS = [BasicInfoFormComponent, DetailsInfoFormComponent];

@NgModule({
	declarations: COMPONENTS,
	exports: COMPONENTS,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		TranslateModule.forChild(),
		FileUploaderModule,
		IonCheckbox,
		IonCol,
		IonDatetime,
		IonDatetimeButton,
		IonGrid,
		IonImg,
		IonInput,
		IonItem,
		IonLabel,
		IonModal,
		IonRow,
		IonSelect,
		IonSelectOption,
		IonTextarea,
		IonThumbnail,
	],
})
export class PromotionFormsModule {}
