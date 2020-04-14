import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { ThemeModule } from '../../../@theme/theme.module';
import { BasicInfoFormComponent } from './basic-info';
import { FileUploaderModule } from '@app/@shared/file-uploader/file-uploader.module';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		FileUploaderModule,
		TranslateModule.forChild(),
	],
	exports: [BasicInfoFormComponent],
	declarations: [BasicInfoFormComponent],
	providers: [],
})
export class UserFormsModule {}
