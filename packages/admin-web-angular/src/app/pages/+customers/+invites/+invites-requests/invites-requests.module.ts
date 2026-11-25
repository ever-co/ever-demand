import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { Ng2SmartTableModule } from '@app/@shared/smart-table';
import { ThemeModule } from '../../../../@theme';
import { ToasterModule } from '@app/@core/toaster';
import { HighlightModule } from 'ngx-highlightjs';
import { InvitesRequestsComponent } from './invites-requests.component';
import { InvitesRequestsService } from '../../../../@core/data/invites-requests.service';
import { CountryRenderComponent } from '../country-render/country-render.component';
import { InvitesService } from '../../../../@core/data/invites.service';
import { DeviceService } from '../../../../@core/data/device.service';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
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
		HighlightModule,
		InvitesRequestsTableModule,
		ConfirmationModalModule,
		NbButtonModule,
	],
	declarations: [InvitesRequestsComponent, CountryRenderComponent],
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
