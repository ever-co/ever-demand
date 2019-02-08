import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { ThemeModule } from '../../../@theme/theme.module';
import { BasicInfoFormComponent } from './basic-info';
import { FileUploadModule } from 'ng2-file-upload';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		FileUploadModule,
		TranslateModule.forChild()
	],
	exports: [BasicInfoFormComponent],
	declarations: [BasicInfoFormComponent],
	providers: []
})
export class UserFormsModule {}
