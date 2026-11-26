import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BasicInfoFormComponent } from './basic-info/basic-info-form.component';
import { LocationFormComponent } from './location/location-form.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { IonCheckbox } from '@ionic/angular/ion-checkbox';
import { IonCol } from '@ionic/angular/ion-col';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonRow } from '@ionic/angular/ion-row';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
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
