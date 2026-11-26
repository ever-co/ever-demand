import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { BasicInfoFormComponent } from './basic-info-form.component';
import { IonicModule } from '@ionic/angular/lazy';
import { FileUploaderModule } from '../../../../components/file-uploader/file-uploader.module';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		IonicModule,
		FormsModule,
		TranslateModule.forChild(),
		FileUploaderModule,
	],
	declarations: [BasicInfoFormComponent],
	exports: [BasicInfoFormComponent],
})
export class CarrierBasicFormsModule {}
