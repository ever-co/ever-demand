import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormWizardModule } from 'angular2-wizard';
import { ThemeModule } from '../../../@theme/theme.module';
import { LocationFormModule } from '../../forms/location';
import { GoogleMapModule } from '../../forms/google-map/google-map.module';
import { InviteRequestModalComponent } from './invite-request-modal.component';
import { NbButtonModule } from '@nebular/theme';

@NgModule({
	imports: [
		ThemeModule,
		FormWizardModule,
		TranslateModule.forChild(),
		LocationFormModule,
		GoogleMapModule,
		NbButtonModule,
	],
	exports: [InviteRequestModalComponent],
	declarations: [InviteRequestModalComponent],
	entryComponents: [InviteRequestModalComponent],
})
export class InviteRequestModalModule {}
