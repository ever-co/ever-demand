import { Injectable } from '@angular/core';

/** Leaves the app for another site (Stripe Checkout, the billing portal). */
@Injectable({ providedIn: 'root' })
export class BrowserNavigation {
	assign(url: string) {
		window.location.assign(url);
	}
}
