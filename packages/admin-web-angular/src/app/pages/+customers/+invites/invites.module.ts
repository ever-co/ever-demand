import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightModule } from 'ngx-highlightjs';
import { ThemeModule } from '../../../@theme';
import { InvitesComponent } from './invites.component';
import { InvitesService } from '../../../@core/data/invites.service';
import { InvitesRequestsModule } from './+invites-requests/invites-requests.module';
import { CountryRenderComponent } from './country-render/country-render.component';
import { NbSpinnerModule, NbButtonModule } from '@nebular/theme';
import { ConfirmationModalModule } from '../../../@shared/confirmation-modal/confirmation-modal.module';

const routes: Routes = [
	{
		path: '',
		component: InvitesComponent,
	},
];

@NgModule({
	imports: [
		CommonModule,
		Ng2SmartTableModule,
		ThemeModule,
		ToasterModule.forRoot(),
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		HighlightModule.forRoot({ theme: 'github' }),
		InvitesRequestsModule,
		NbSpinnerModule,
		ConfirmationModalModule,
		NbButtonModule,
	],
	declarations: [InvitesComponent],
	entryComponents: [CountryRenderComponent],
	providers: [JsonPipe, InvitesService],
})
export class InvitesModule {
	public static routes = routes;
}
