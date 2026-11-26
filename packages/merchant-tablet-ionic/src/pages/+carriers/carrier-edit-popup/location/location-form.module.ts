import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploadModule } from 'ng2-file-upload';
import { LocationFormComponent } from './location-form.component';
import { GoogleMapModule } from '../../../../@shared/google-map/google-map.module';
import { IonButton } from '@ionic/angular/ion-button';
import { IonCheckbox } from '@ionic/angular/ion-checkbox';
import { IonCol } from '@ionic/angular/ion-col';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonRow } from '@ionic/angular/ion-row';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';

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
