import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { BasicInfoFormComponent } from './basic-info';
import { ThemeModule } from '@app/@theme';
import { FileUploaderModule } from '@app/@shared/file-uploader/file-uploader.module';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule.forChild(),
		FileUploaderModule,
	],
	exports: [BasicInfoFormComponent],
	declarations: [BasicInfoFormComponent],
})
export class CarrierFormsModule {}
