import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightModule } from 'ngx-highlightjs';
import { ThemeModule } from '../../../@theme';
import { InvitesComponent } from './invites.component';
import { InvitesService } from '../../../@core/data/invites.service';
import { InvitesRequestsModule } from './+invites-requests/invites-requests.module';
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
		FormsModule,
		Ng2SmartTableModule,
		ThemeModule,
		ToasterModule.forRoot(),
		RouterModule.forChild(routes),
		TranslateModule.forChild(),
		HighlightModule,
		InvitesRequestsModule,
		NbSpinnerModule,
		ConfirmationModalModule,
		NbButtonModule,
	],
	declarations: [InvitesComponent],
	providers: [JsonPipe, InvitesService],
})
export class InvitesModule {
	public static routes = routes;
}
