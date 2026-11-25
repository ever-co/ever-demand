import { NgModule } from '@angular/core';
import { LocationFormComponent } from './location-form.component';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { FormWizardModule } from '@app/@shared/wizard';
import { ThemeModule } from '../../../@theme';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule.forChild(),
	],
	exports: [LocationFormComponent],
	declarations: [LocationFormComponent],
})
export class LocationFormModule {}
