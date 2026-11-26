import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FileUploadModule } from 'ng2-file-upload';
import { FileUploaderComponent } from './file-uploader.component';
import { FormsModule } from '@angular/forms';
import { NbButtonModule } from '@nebular/theme';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		TranslateModule.forChild(),
		FileUploadModule,
		NbButtonModule,
	],
	exports: [FileUploaderComponent],
	declarations: [FileUploaderComponent],
})
export class FileUploaderModule {}
