import { Injectable } from '@angular/core';

@Injectable()
export class StripeLoader {
	constructor() {
		this.load();
	}

	private load() {
		const node = document.createElement('script');
		node.src = `https://checkout.stripe.com/checkout.js`;
		node.type = 'text/javascript';
		document.getElementsByTagName('head')[0].appendChild(node);
	}
}
