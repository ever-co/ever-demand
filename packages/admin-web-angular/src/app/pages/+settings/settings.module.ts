import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NbAlertModule, NbButtonModule, NbSpinnerModule } from '@nebular/theme';
import { ToasterModule } from '@app/@core/toaster';
import { TranslateModule } from '@modules/client.common.angular2/locale/translate.module';
import { ThemeModule } from '../../@theme';
import { ConfirmationModalModule } from '../../@shared/confirmation-modal/confirmation-modal.module';
import { SettingsComponent } from './settings.component';
import { TenantSettingsComponent } from './tenant/tenant-settings.component';
import { BillingComponent } from './billing/billing.component';
import { MembersComponent } from './members/members.component';

const routes: Routes = [
	{
		path: '',
		component: SettingsComponent,
		children: [
			{ path: '', redirectTo: 'tenant', pathMatch: 'full' },
			{ path: 'tenant', component: TenantSettingsComponent },
			{ path: 'billing', component: BillingComponent },
			{ path: 'members', component: MembersComponent },
		],
	},
];

/** `#/settings/{tenant,billing,members}`: the business (tenant) of the logged-in admin. */
@NgModule({
	imports: [
		CommonModule,
		ThemeModule,
		ToasterModule.forRoot(),
		TranslateModule.forChild(),
		RouterModule.forChild(routes),
		ConfirmationModalModule,
		NbAlertModule,
		NbButtonModule,
		NbSpinnerModule,
	],
	declarations: [
		SettingsComponent,
		TenantSettingsComponent,
		BillingComponent,
		MembersComponent,
	],
})
export class SettingsModule {}
