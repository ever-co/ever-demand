import Stripe from 'stripe';

/**
 * Stripe API version of every call the API makes (cards are customer sources,
 * payments are charges). The payment flows were written against it, so it is
 * pinned instead of following the newest version of the SDK (stripe-node sends
 * it as the Stripe-Version header). Moving to a newer version means re-checking
 * the charge, refund and source objects those flows read.
 */
export const STRIPE_API_VERSION =
	'2020-08-27' as unknown as Stripe.LatestApiVersion;

/** A Stripe client on the pinned API version. Throws when `secretKey` is empty. */
export function createStripeClient(secretKey: string): Stripe {
	return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
}
