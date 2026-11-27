import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ValidationErrors,
	Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import {
	debounceTime,
	distinctUntilChanged,
	switchMap,
	takeUntil,
	tap,
} from 'rxjs/operators';
import { environment } from 'environments/environment';
import {
	BillingInterval,
	TenantPlanView,
	TenantsService,
} from '@app/@core/data/tenants.service';
import { SignupFlowService } from '@app/@core/tenant/signup-flow.service';
import {
	cleanBaseDomain,
	shopAddress,
	slugProblem,
	suggestSlug,
} from '@app/@core/tenant/tenant-rules';

export type SlugStatus = 'checking' | 'available' | 'taken' | null;

/** Angular validator: a slug the API accepts (it checks again, and whether it is free). */
export function slugValidator(
	control: AbstractControl,
): ValidationErrors | null {
	const problem = slugProblem(control.value);
	return problem ? { slug: problem } : null;
}

/** Used when the API has no plans to show (it always has Starter). */
const STARTER: TenantPlanView = {
	plan: 'starter',
	label: 'Starter',
	includedMembers: 15,
	extraMembers: false,
	maxStores: 3,
	monthlyPrice: 0,
	annualMonthlyPrice: 0,
	extraMemberPrice: null,
	paid: false,
};

/**
 * Tenant signup (DESIGN.md §6, `#/auth/signup`): business, address, owner and
 * plan. The address is suggested from the business name until the owner
 * edits it, and checked live with `isTenantSlugAvailable`.
 */
@Component({
	standalone: false,
	selector: 'ea-signup',
	styleUrls: ['./signup.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: './signup.component.html',
})
export class SignupComponent implements OnInit, OnDestroy {
	readonly form: FormGroup;
	readonly baseDomain = cleanBaseDomain(environment.TENANT_BASE_DOMAIN);

	plans: TenantPlanView[] = [STARTER];
	plansError: string | null = null;
	slugStatus: SlugStatus = null;
	submitting = false;
	error: string | null = null;

	/** The owner typed an address: stop suggesting one from the name */
	private slugEdited = false;
	private readonly destroy$ = new Subject<void>();

	constructor(
		fb: FormBuilder,
		private readonly tenants: TenantsService,
		private readonly flow: SignupFlowService,
	) {
		this.form = fb.group({
			businessName: [
				'',
				[
					Validators.required,
					Validators.minLength(2),
					Validators.maxLength(80),
				],
			],
			slug: ['', [slugValidator]],
			firstName: [''],
			lastName: [''],
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(8)]],
			plan: ['starter', Validators.required],
			interval: ['monthly' as BillingInterval],
		});
	}

	get slug(): string {
		return String(this.form.get('slug').value ?? '')
			.trim()
			.toLowerCase();
	}

	get shopAddress(): string | null {
		return slugProblem(this.slug)
			? null
			: shopAddress(this.slug, this.baseDomain);
	}

	get selectedPlan(): TenantPlanView {
		const key = this.form.get('plan').value;
		return this.plans.find((p) => p.plan === key) ?? STARTER;
	}

	get canSubmit(): boolean {
		return (
			this.form.valid &&
			!this.submitting &&
			this.slugStatus !== 'taken' &&
			this.slugStatus !== 'checking'
		);
	}

	ngOnInit() {
		this.form
			.get('businessName')
			.valueChanges.pipe(takeUntil(this.destroy$))
			.subscribe((name) => {
				if (!this.slugEdited) {
					this.form.get('slug').setValue(suggestSlug(name));
				}
			});

		this.form
			.get('slug')
			.valueChanges.pipe(
				tap(() => (this.slugStatus = null)),
				debounceTime(400),
				distinctUntilChanged(),
				switchMap(async (value) => {
					const slug = String(value ?? '')
						.trim()
						.toLowerCase();

					if (slugProblem(slug)) {
						return null;
					}

					this.slugStatus = 'checking';

					try {
						const free = await this.tenants.isSlugAvailable(slug);
						return free ? 'available' : 'taken';
					} catch {
						// the API checks again on submit
						return null;
					}
				}),
				takeUntil(this.destroy$),
			)
			.subscribe((status: SlugStatus) => {
				this.slugStatus = status;
			});

		void this.loadPlans();
	}

	/** The owner typed in the address field (an empty field resumes the suggestion). */
	onSlugInput() {
		this.slugEdited = this.slug !== '';
	}

	errorOf(name: string): string | null {
		const control = this.form.get(name);

		if (
			!control ||
			!control.errors ||
			!(control.touched || control.dirty)
		) {
			return null;
		}

		if (control.errors.slug) {
			// REQUIRED, TOO_SHORT, TOO_LONG or FORMAT
			return control.errors.slug;
		}

		if (control.errors.required) {
			return 'REQUIRED';
		}

		if (name === 'email') {
			return 'EMAIL';
		}

		if (name === 'password') {
			return 'PASSWORD';
		}

		return 'NAME';
	}

	async submit() {
		if (!this.canSubmit) {
			this.form.markAllAsTouched();
			return;
		}

		this.submitting = true;
		this.error = null;

		try {
			const value = this.form.value;

			await this.flow.signup(
				{
					businessName: value.businessName,
					slug: this.slug,
					email: value.email,
					password: value.password,
					firstName: value.firstName,
					lastName: value.lastName,
				},
				this.selectedPlan,
				value.interval,
			);
		} catch (err) {
			this.error = (err as Error)?.message ?? String(err);
		} finally {
			this.submitting = false;
		}
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private async loadPlans() {
		try {
			const plans = await this.tenants.plans();

			if (plans?.length) {
				this.plans = plans;
			}
		} catch (err) {
			this.plansError = (err as Error)?.message ?? String(err);
		}
	}
}
