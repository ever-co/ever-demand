import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

/** Settings of the business (tenant): its details, billing and members. */
@Component({
	standalone: false,
	selector: 'ea-settings',
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<toaster-container></toaster-container>
		<nb-card class="settings">
			<nb-card-body>
				<nb-route-tabset [tabs]="tabs" fullWidth></nb-route-tabset>
			</nb-card-body>
		</nb-card>
	`,
})
export class SettingsComponent implements OnDestroy {
	tabs: { title: string; route: string; icon: string }[] = [];

	private readonly langChange: Subscription;

	constructor(private readonly translate: TranslateService) {
		this.buildTabs();
		this.langChange = this.translate.onLangChange.subscribe(() =>
			this.buildTabs(),
		);
	}

	ngOnDestroy() {
		this.langChange.unsubscribe();
	}

	private buildTabs() {
		this.tabs = [
			{
				title: this.translate.instant('TENANT_VIEW.MENU.SETTINGS'),
				route: '/settings/tenant',
				icon: 'briefcase-outline',
			},
			{
				title: this.translate.instant('TENANT_VIEW.MENU.BILLING'),
				route: '/settings/billing',
				icon: 'credit-card-outline',
			},
			{
				title: this.translate.instant('TENANT_VIEW.MENU.MEMBERS'),
				route: '/settings/members',
				icon: 'people-outline',
			},
		];
	}
}
