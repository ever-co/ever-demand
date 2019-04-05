import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BasicInfoFormComponent } from './basic-info';
import { FileUploaderModule } from 'app/@shared/file-uploader/file-uploader.module';
import { ThemeModule } from 'app/@theme';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		TranslateModule.forChild(),
		FileUploaderModule,
		FormsModule
	],
	exports: [BasicInfoFormComponent],
	declarations: [BasicInfoFormComponent]
})
export class ProductCategoriesFormsModule {}
