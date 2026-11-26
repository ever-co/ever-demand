import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ToasterService } from '../../../@core/toaster';
import {
	TenantListItemView,
	TenantsService,
} from '../../../@core/data/tenants.service';
import { AdminSessionService } from '../../../@core/tenant/admin-session.service';

/**
 * Header dropdown of a platform super-admin (DESIGN.md §6): picks the tenant
 * every request acts in (`Tenant-Id`). "Platform (default)" goes back to the
 * super-admin's own tenant. Not shown to anybody else.
 */
@Component({
	standalone: false,
	selector: 'ea-tenant-switcher',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./tenant-switcher.component.scss'],
	template: `
		<label class="switcher" for="tenant-switcher">
			<span class="switcher-label">{{
				'TENANT_VIEW.SWITCHER.LABEL' | translate
			}}</span>
			<select
				id="tenant-switcher"
				class="form-select form-select-sm"
				[value]="current"
				[disabled]="busy"
				(focus)="loadOnce()"
				(change)="switchTo($any($event.target).value)"
			>
				<option value="">
					{{ 'TENANT_VIEW.SWITCHER.PLATFORM' | translate }}
				</option>
				<option
					*ngIf="current && !hasCurrent"
					[value]="current"
					selected
				>
					{{ current }}
				</option>
				<option
					*ngFor="let item of tenants"
					[value]="item.tenant.slug"
					[selected]="item.tenant.slug === current"
				>
					{{ item.tenant.name }} ({{ item.tenant.slug }})
					<ng-container *ngIf="item.tenant.status !== 'active'">
						&middot; {{ item.tenant.status }}</ng-container
					>
				</option>
			</select>
		</label>
	`,
})
export class TenantSwitcherComponent implements OnInit {
	tenants: TenantListItemView[] = [];
	busy = false;

	private loaded = false;

	constructor(
		private readonly session: AdminSessionService,
		private readonly tenantsService: TenantsService,
		private readonly toaster: ToasterService,
	) {}

	/** The slug acted in; '' = the platform tenant. */
	get current(): string {
		return this.session.switchedTenant ?? '';
	}

	get hasCurrent(): boolean {
		return this.tenants.some((t) => t.tenant.slug === this.current);
	}

	ngOnInit() {
		void this.loadOnce();
	}

	async loadOnce() {
		if (this.loaded || !this.session.isSuperAdmin) {
			return;
		}

		this.loaded = true;

		try {
			const list = (await this.tenantsService.list()) ?? [];
			// the platform tenant is the "Platform (default)" entry
			this.tenants = list
				.filter((item) => !item.tenant.isPlatform)
				.sort((a, b) => a.tenant.name.localeCompare(b.tenant.name));
		} catch (err) {
			this.loaded = false;
			this.toaster.pop('error', (err as Error).message);
		}
	}

	async switchTo(slug: string) {
		if ((slug || '') === this.current) {
			return;
		}

		this.busy = true;

		try {
			await this.session.switchTenant(slug || null);
		} catch (err) {
			this.toaster.pop('error', (err as Error).message);
		} finally {
			this.busy = false;
		}
	}
}
