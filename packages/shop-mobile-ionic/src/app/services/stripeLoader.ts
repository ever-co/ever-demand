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
			this.state = 'loaded';
		});

		node.addEventListener('error', () => {
			this.state = 'failed';
			// A failed script tag never loads again; the next attempt adds
			// a new one, so the page keeps one script tag.
			node.parentNode?.removeChild(node);
		});

		document.getElementsByTagName('head')[0].appendChild(node);
	}
}
