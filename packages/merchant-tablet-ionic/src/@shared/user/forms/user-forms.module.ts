import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BasicInfoFormComponent } from './basic-info/basic-info-form.component';
import { LocationFormComponent } from './location/location-form.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import {
	IonCheckbox,
	IonCol,
	IonGrid,
	IonIcon,
	IonInput,
	IonItem,
	IonRow,
	IonSearchbar,
	IonSelect,
	IonSelectOption,
} from '@ionic/angular';
import { FileUploaderModule } from '../../../components/file-uploader/file-uploader.module';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		TranslateModule.forChild(),
		FileUploaderModule,
		IonCheckbox,
		IonCol,
		IonGrid,
		IonIcon,
		IonInput,
		IonItem,
		IonRow,
		IonSearchbar,
		IonSelect,
		IonSelectOption,
	],
	declarations: [BasicInfoFormComponent, LocationFormComponent],
	exports: [BasicInfoFormComponent, LocationFormComponent],
})
export class UserFormsModule {}
