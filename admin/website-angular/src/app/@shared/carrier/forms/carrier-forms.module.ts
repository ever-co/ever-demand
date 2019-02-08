import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { BasicInfoFormComponent } from './basic-info';
import { ThemeModule } from '../../../@theme';
import { FileUploadModule } from 'ng2-file-upload';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule.forChild(),
		FileUploadModule
	],
	exports: [BasicInfoFormComponent],
	declarations: [BasicInfoFormComponent]
})
export class CarrierFormsModule {}
