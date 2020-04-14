import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { ThemeModule } from '../../../../@theme';
import { PasswordUpdateFormComponent } from './password-update-form.component';

@NgModule({
	imports: [ThemeModule, FormWizardModule, TranslateModule.forChild()],
	exports: [PasswordUpdateFormComponent],
	declarations: [PasswordUpdateFormComponent],
})
export class LocationFormModule {}
