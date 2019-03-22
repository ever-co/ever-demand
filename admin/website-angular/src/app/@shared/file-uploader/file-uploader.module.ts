import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadModule } from 'ng2-file-upload';
import { FileUploaderComponent } from './file-uploader.component';
import { FormsModule } from '@angular/forms';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		TranslateModule.forChild(),
		FileUploadModule
	],
	exports: [FileUploaderComponent],
	declarations: [FileUploaderComponent]
})
export class FileUploaderModule {}
