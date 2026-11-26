import { NgModule, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonRow } from '@ionic/angular/ion-row';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploadModule } from 'ng2-file-upload';
import { FileUploaderComponent } from './file-uploader.component';
import { FormsModule } from '@angular/forms';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		TranslateModule.forChild(),
		FileUploadModule,
		IonGrid,
		IonInput,
		IonItem,
		IonRow,
	],
	exports: [FileUploaderComponent],
	declarations: [FileUploaderComponent],
})
export class FileUploaderModule {}
