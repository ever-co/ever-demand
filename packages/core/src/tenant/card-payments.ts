import { env } from '../env';
import { TenantContext } from './tenant-context';
import { tenantDirectory } from './tenant-directory';

/** A tenant without its own Stripe account asked for a card payment. */
export class CardPaymentsUnavailableError extends Error {
	readonly name = 'CardPaymentsUnavailableError';

	constructor() {
		super(
			'Card payments are not available for this business yet: pay in cash on delivery'
		);
	}
}

/**
 * Whether the current tenant may take card payments. The shops' card flows
 * (cards, charges, refunds) run on the platform's Stripe account
 * (STRIPE_SECRET_KEY), so only the platform tenant may use them: money of
 * another business would land on the platform's account. Other tenants pay
 * in cash on delivery until Stripe Connect gives them their own accounts
 * (DESIGN.md §3.8). A single-tenant install is its own platform.
 */
export function tenantMayTakeCardPayments(): boolean {
	if (!env.MULTI_TENANT || TenantContext.isSystem()) {
		return true;
	}

	const tenantId = TenantContext.tenantId();

	return tenantId != null && tenantId === tenantDirectory.getDefaultTenantId();
}

/** Throws CardPaymentsUnavailableError unless the current tenant may take card payments. */
export function assertCardPaymentsAvailable(): void {
	if (!tenantMayTakeCardPayments()) {
		throw new CardPaymentsUnavailableError();
	}
}
