import { Injectable } from '@angular/core';

@Injectable()
export class MercadoLoader {
	constructor() {
		this.load();
	}

	private load() {
		const node = document.createElement('script');
		node.src =
			'https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js';
		node.type = 'text/javascript';
		document.getElementsByTagName('head')[0].appendChild(node);
	}
}
