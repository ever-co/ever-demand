import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { ToasterService } from '@app/@core/toaster';
import { TenantsService, TenantView } from '@app/@core/data/tenants.service';
import { AdminSessionService } from '@app/@core/tenant/admin-session.service';
import {
	cleanBaseDomain,
	shopAddress,
	TenantPermissions,
} from '@app/@core/tenant/tenant-rules';

/** Languages the admin app ships (theme-settings.component.ts). */
export const TENANT_LANGUAGES = [
	{ code: 'en-US', name: 'English' },
	{ code: 'bg-BG', name: 'Български' },
	{ code: 'he-IL', name: 'עברית' },
	{ code: 'ru-RU', name: 'Русский' },
	{ code: 'es-ES', name: 'Español' },
	{ code: 'fr-FR', name: 'Français' },
];

/** Settings → Business: name, logo, currency, language; the address is shown only. */
@Component({
	standalone: false,
	selector: 'ea-tenant-settings',
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './tenant-settings.component.html',
})
export class TenantSettingsComponent implements OnInit {
	readonly languages = TENANT_LANGUAGES;
	readonly baseDomain = cleanBaseDomain(environment.TENANT_BASE_DOMAIN);
	readonly permissions: TenantPermissions;
	readonly form: FormGroup;

	tenant: TenantView | null = null;
	currencies: string[] = [];
	loading = true;
	saving = false;
	error: string | null = null;

	constructor(
		fb: FormBuilder,
		session: AdminSessionService,
		private readonly tenants: TenantsService,
		private readonly apollo: Apollo,
		private readonly toaster: ToasterService,
		private readonly translate: TranslateService,
	) {
		this.permissions = session.permissions();
		this.form = fb.group({
			name: [
				'',
				[
					Validators.required,
					Validators.minLength(2),
					Validators.maxLength(80),
				],
			],
			logoUrl: [''],
			currency: [''],
			language: [''],
		});

		if (!this.permissions.canEditTenant) {
			this.form.disable();
		}
	}

	get shopAddress(): string | null {
		return shopAddress(this.tenant?.slug, this.baseDomain);
	}

	async ngOnInit() {
		await Promise.all([this.load(), this.loadCurrencies()]);
	}

	async save() {
		if (!this.permissions.canEditTenant || this.form.invalid || this.saving) {
			return;
		}

		this.saving = true;

		try {
			const value = this.form.getRawValue();
			this.tenant = await this.tenants.update({
				name: value.name.trim(),
				settings: {
					logoUrl: value.logoUrl.trim(),
					currency: value.currency,
					language: value.language,
				},
			});
			this.fill(this.tenant);
			this.toaster.pop(
				'success',
				this.translate.instant('TENANT_VIEW.SETTINGS.SAVED'),
			);
		} catch (err) {
			this.toaster.pop('error', (err as Error).message);
		} finally {
			this.saving = false;
		}
	}

	private async load() {
		this.loading = true;
		this.error = null;

		try {
			this.tenant = await this.tenants.current();
			this.fill(this.tenant);
		} catch (err) {
			this.error = (err as Error).message;
		} finally {
			this.loading = false;
		}
	}

	private fill(tenant: TenantView | null) {
		this.form.reset({
			name: tenant?.name ?? '',
			logoUrl: tenant?.settings?.logoUrl ?? '',
			currency: tenant?.settings?.currency ?? '',
			language: tenant?.settings?.language ?? '',
		});
	}

	/** Currencies are shared reference data of the platform. */
	private async loadCurrencies() {
		try {
			const res: any = await firstValueFrom(
				this.apollo.query({
					query: gql`
						query TenantCurrencies {
							currencies {
								currencyCode
							}
						}
					`,
				}),
			);
			this.currencies = (res?.data?.currencies ?? [])
				.map((c) => c.currencyCode)
				.filter(Boolean);
		} catch {
			this.currencies = [];
		}
	}
}
