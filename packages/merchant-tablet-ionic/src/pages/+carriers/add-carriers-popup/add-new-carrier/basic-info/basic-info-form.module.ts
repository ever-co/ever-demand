import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicInfoFormComponent } from './basic-info-form.component';
import { IonicModule } from '@ionic/angular';
import { FileUploaderModule } from 'components/file-uploader/file-uploader.module';

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		IonicModule,
		TranslateModule.forChild(),
		FormsModule,
		FileUploaderModule,
	],
	declarations: [BasicInfoFormComponent],
	exports: [BasicInfoFormComponent],
})
export class CarrierBasicFormsModule {}
