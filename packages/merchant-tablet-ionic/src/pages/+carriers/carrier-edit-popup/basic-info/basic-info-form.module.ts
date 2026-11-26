import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { BasicInfoFormComponent } from './basic-info-form.component';
import { IonCol } from '@ionic/angular/ion-col';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonRow } from '@ionic/angular/ion-row';
import { FileUploaderModule } from '../../../../components/file-uploader/file-uploader.module';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		TranslateModule.forChild(),
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
