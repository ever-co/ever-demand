import { NgModule } from '@angular/core';
import { BasicInfoFormComponent } from './basic-info/basic-info-form.component';
import { DetailsInfoFormComponent } from './details-info/details-info-form.component';
import { IonCheckbox } from '@ionic/angular/ion-checkbox';
import { IonCol } from '@ionic/angular/ion-col';
import { IonDatetime } from '@ionic/angular/ion-datetime';
import { IonDatetimeButton } from '@ionic/angular/ion-datetime-button';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonImg } from '@ionic/angular/ion-img';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonModal } from '@ionic/angular/ion-modal';
import { IonRow } from '@ionic/angular/ion-row';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { IonTextarea } from '@ionic/angular/ion-textarea';
import { IonThumbnail } from '@ionic/angular/ion-thumbnail';
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
