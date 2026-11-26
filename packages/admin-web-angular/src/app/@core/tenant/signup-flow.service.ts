import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
	BillingInterval,
	TenantPlanView,
	TenantSignupInput,
	TenantsService,
} from '../data/tenants.service';
import { BrowserNavigation } from '../utils/browser-navigation';
import { AdminSessionService } from './admin-session.service';
import { isHttpUrl } from './tenant-rules';

export type SignupOutcome =
	/** Starter: the owner is logged in and on the dashboard */
	| { kind: 'dashboard' }
	/** Paid plan: the browser is on its way to Stripe Checkout */
	| { kind: 'checkout'; url: string }
	/** The business exists and the owner is logged in, but Checkout failed */
	| { kind: 'checkout-failed'; error: string };

/**
 * The tenant signup of DESIGN.md §6: `signupTenant` creates the business on
 * the Starter plan with its owner and logs the owner in (kept exactly like a
 * normal login). A paid plan then goes to Stripe Checkout, which returns to
 * Settings → Billing.
 */
@Injectable({ providedIn: 'root' })
export class SignupFlowService {
	constructor(
		private readonly tenants: TenantsService,
		private readonly session: AdminSessionService,
		private readonly router: Router,
		private readonly browser: BrowserNavigation,
	) {}

	async signup(
		input: TenantSignupInput,
		plan: Pick<TenantPlanView, 'plan' | 'paid'>,
		interval: BillingInterval = 'monthly',
	): Promise<SignupOutcome> {
		const result = await this.tenants.signup({
			businessName: input.businessName.trim(),
			slug: input.slug.trim().toLowerCase(),
			email: input.email.trim().toLowerCase(),
			password: input.password,
			firstName: input.firstName?.trim() || undefined,
			lastName: input.lastName?.trim() || undefined,
		});

		this.session.start(result.token, result.admin);

		if (!plan?.paid) {
			await this.router.navigate(['/dashboard']);
			return { kind: 'dashboard' };
		}

		try {
			const { url } = await this.tenants.checkout({
				plan: plan.plan,
				interval,
				extraMembers: 0,
			});

			if (!isHttpUrl(url)) {
				throw new Error('The payment page has no valid address');
			}

			this.browser.assign(url);
			return { kind: 'checkout', url };
		} catch (err) {
			const error = (err as Error)?.message ?? String(err);
			// the business exists: the owner picks the plan again in Settings → Billing
			await this.router.navigate(['/settings/billing'], {
				queryParams: { checkout: 'failed' },
			});
			return { kind: 'checkout-failed', error };
		}
	}
}
