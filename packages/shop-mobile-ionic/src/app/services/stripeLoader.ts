import { Injectable, InjectionToken, inject } from '@angular/core';
// The pure entry point adds the Stripe.js script only when loadStripe is
// called; the main entry point adds it as soon as the module is imported.
import { loadStripe } from '@stripe/stripe-js/pure';
// Types only: a value import of '@stripe/stripe-js' would add the script.
import type { Stripe } from '@stripe/stripe-js';
import { environment } from 'environments/environment';

export type LoadStripe = (publishableKey: string) => Promise<Stripe | null>;

// Loads Stripe.js (https://js.stripe.com, the card form behind Pay now)
// with the @stripe/stripe-js loader. Specs replace it, so none of them
// fetches the real script.
export const LOAD_STRIPE = new InjectionToken<LoadStripe>('LOAD_STRIPE', {
	providedIn: 'root',
	factory: () => loadStripe,
});

export const STRIPE_PUBLISHABLE_KEY = new InjectionToken<string>(
	'STRIPE_PUBLISHABLE_KEY',
	{
		providedIn: 'root',
		factory: () => environment.STRIPE_PUBLISHABLE_KEY,
	}
);

// Loads Stripe.js, the card form behind Pay now, for the app's publishable
// key. One instance for the app, so the page gets one script tag.
//
// Nothing waits for it: a content blocker, a firewall or no network keeps
// the script from loading, or it is still loading when the customer taps
// Pay now. Pay now then tells the customer and calls ensureLoaded, so a
// later tap finds the card form (#1663).
@Injectable({ providedIn: 'root' })
export class StripeLoader {
	private readonly _loadStripe = inject(LOAD_STRIPE);
	private readonly _publishableKey = inject(STRIPE_PUBLISHABLE_KEY);

	private _stripe: Stripe | null = null;
	private state: 'idle' | 'loading' | 'loaded' | 'failed' = 'idle';

	constructor() {
		this.load();
	}

	// Stripe.js for the app's key. Null while the script loads, after it
	// failed, and in a build without a key.
	get stripe(): Stripe | null {
		return this._stripe;
	}

	// Loads Stripe.js again after a failed attempt, e.g. once the network
	// is back. Does nothing while it loads or after it loaded.
	ensureLoaded(): void {
		if (this.state === 'failed') {
			this.load();
		}
	}

	private load(): void {
		// scripts/env.ts defaults STRIPE_PUBLISHABLE_KEY to '': such a build
		// cannot take card payments (Pay now says so), so it does not fetch
		// Stripe.js at all.
		if (!this._publishableKey) {
			return;
		}

		this.state = 'loading';

		let loading: Promise<Stripe | null>;

		try {
			// loadStripe adds the script tag once, tries a failed load once
			// more by itself, and adds the script again on the next call
			// after it failed for good. A response that is not Stripe.js,
			// e.g. a page from an intercepting proxy, also fails it.
			loading = this._loadStripe(this._publishableKey);
		} catch (err) {
			loading = Promise.reject(err);
		}

		loading.then(
			(stripe) => {
				if (stripe) {
					this._stripe = stripe;
					this.state = 'loaded';
				} else {
					this.fail(new Error('Stripe.js is not available'));
				}
			},
			(err) => this.fail(err)
		);
	}

	private fail(err: unknown): void {
		this.state = 'failed';
		console.warn('Stripe.js did not load; Pay now loads it again.', err);
	}
}
