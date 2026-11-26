import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploadModule } from 'ng2-file-upload';
import { LocationFormComponent } from './location-form.component';
import { GoogleMapModule } from '../../../../@shared/google-map/google-map.module';
import {
	IonButton,
	IonCheckbox,
	IonCol,
	IonGrid,
	IonInput,
	IonItem,
	IonRow,
	IonSearchbar,
	IonSelect,
	IonSelectOption,
} from '@ionic/angular';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FileUploadModule,
		GoogleMapModule,
		TranslateModule.forChild(),
		FormsModule,
		IonButton,
		IonCheckbox,
		IonCol,
		IonGrid,
		IonInput,
		IonItem,
		IonRow,
		IonSearchbar,
		IonSelect,
		IonSelectOption,
	],
	declarations: [LocationFormComponent],
	exports: [LocationFormComponent],
})
export class CarrierLocationFormsModule {}
