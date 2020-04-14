import { NgModule } from '@angular/core';
import { LocationFormComponent } from './location-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { ThemeModule } from '../../../@theme';
import { AgmCoreModule } from '@agm/core';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule.forChild(),
		AgmCoreModule,
	],
	exports: [LocationFormComponent],
	declarations: [LocationFormComponent],
})
export class LocationFormModule {}
