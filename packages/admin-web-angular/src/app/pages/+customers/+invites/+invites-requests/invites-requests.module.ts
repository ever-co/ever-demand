import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ThemeModule } from '../../../../@theme';
import { ToasterModule } from 'angular2-toaster';
import { HighlightModule } from 'ngx-highlightjs';
import { InvitesRequestsComponent } from './invites-requests.component';
import { InvitesRequestsService } from '../../../../@core/data/invites-requests.service';
import { CountryRenderComponent } from '../country-render/country-render.component';
import { InvitesService } from '../../../../@core/data/invites.service';
import { DeviceService } from '../../../../@core/data/device.service';
import { TranslateModule } from '@ngx-translate/core';
import { InvitesRequestsTableModule } from '@app/@shared/render-component/invites-requests/invites-requests.module';
import { NotifyService } from '@app/@core/services/notify/notify.service';
import { ConfirmationModalModule } from '../../../../@shared/confirmation-modal/confirmation-modal.module';
import { NbButtonModule } from '@nebular/theme';
@NgModule({
	imports: [
		CommonModule,
		Ng2SmartTableModule,
		ThemeModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild(),
		HighlightModule.forRoot({ theme: 'github' }),
		InvitesRequestsTableModule,
		ConfirmationModalModule,
		NbButtonModule,
	],
	declarations: [InvitesRequestsComponent, CountryRenderComponent],
	entryComponents: [CountryRenderComponent],
	providers: [
		JsonPipe,
		InvitesRequestsService,
		InvitesService,
		DeviceService,
		NotifyService,
	],
	exports: [CountryRenderComponent, InvitesRequestsComponent],
})
export class InvitesRequestsModule {}
