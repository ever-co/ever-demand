import { Injectable } from '@angular/core';

export const STRIPE_CHECKOUT_SCRIPT_URL =
	'https://checkout.stripe.com/checkout.js';

// Adds the Stripe Checkout script, the card form behind Pay now, to the
// page. One instance for the app, so the page gets one script tag.
@Injectable({ providedIn: 'root' })
export class StripeLoader {
	private state: 'loading' | 'loaded' | 'failed';

	constructor() {
		this.load();
	}

	// Adds the script again after a failed attempt, e.g. once the network
	// is back. Does nothing while the script loads or after it loaded.
	ensureLoaded(): void {
		if (this.state === 'failed') {
			this.load();
		}
	}

	private load() {
		const node = document.createElement('script');
		node.src = STRIPE_CHECKOUT_SCRIPT_URL;
		node.type = 'text/javascript';

		this.state = 'loading';

		node.addEventListener('load', () => {
			// A response that is not the Checkout script, e.g. a page from
			// an intercepting proxy, also fires load: without the card form
			// it counts as failed, so the next tap adds the script again.
			if (typeof (<any>window).StripeCheckout?.configure === 'function') {
				this.state = 'loaded';
			} else {
				this.fail(node);
			}
		});

		node.addEventListener('error', () => this.fail(node));

		document.getElementsByTagName('head')[0].appendChild(node);
	}

	private fail(node: HTMLScriptElement) {
		this.state = 'failed';
		// A failed script tag never loads again; the next attempt adds a
		// new one, so the page keeps one script tag.
		node.remove();
	}
}
