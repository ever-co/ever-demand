import { NgModule, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploadModule } from 'ng2-file-upload';
import { FileUploaderComponent } from './file-uploader.component';
import { FormsModule } from '@angular/forms';

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		FormsModule,
		TranslateModule.forChild(),
		FileUploadModule,
	],
	exports: [FileUploaderComponent],
	declarations: [FileUploaderComponent],
})
export class FileUploaderModule {}
