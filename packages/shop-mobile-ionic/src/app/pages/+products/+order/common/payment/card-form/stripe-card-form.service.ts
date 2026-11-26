import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular/lazy';
import type { Stripe } from '@stripe/stripe-js';
import {
	CARD_TOKEN_ROLE,
	CardFormToken,
	StripeCardModalComponent,
} from './stripe-card-modal.component';

export interface CardFormOptions {
	// Stripe.js for the app's key (StripeLoader.stripe)
	stripe: Stripe;
	image: string;
	name: string;
	description: string;
	// In the currency's smallest unit (cents)
	amount: number;
	currency: string;
	// Gets the card token after the customer tapped Pay in the form
	token: (token: CardFormToken) => unknown;
	// Runs once whenever the form closes: after a token, a cancel, a tap on
	// the backdrop or the back button
	closed: () => void;
}

// Opens the new-card form (StripeCardModalComponent) in a modal: what
// StripeCheckout.configure(options).open() did with the legacy Checkout
// popup, with the same token and closed callbacks.
@Injectable({ providedIn: 'root' })
export class StripeCardForm {
	// True from the tap until the form shows: a double tap on Pay now opens
	// one form.
	private opening: boolean = false;

	constructor(private readonly modalController: ModalController) {}

	async open(options: CardFormOptions): Promise<void> {
		if (this.opening) {
			return;
		}

		this.opening = true;

		try {
			let modal: HTMLIonModalElement | undefined;

			modal = await this.modalController.create({
				component: StripeCardModalComponent,
				cssClass: 'stripe-card-modal',
				componentProps: {
					stripe: options.stripe,
					image: options.image,
					name: options.name,
					description: options.description,
					amount: options.amount,
					currency: options.currency,
					dismiss: (token?: CardFormToken, role?: string) =>
						modal ? modal.dismiss(token, role) : Promise.resolve(false),
				},
			});

			// As with Checkout, the token callback runs first: it marks the
			// payment as running before closed shows the order again, so the
			// Pay buttons there stay disabled. It starts as the form begins to
			// close; closed runs once it is gone.
			void modal.onWillDismiss().then(({ data, role }) => {
				if (role === CARD_TOKEN_ROLE && data) {
					Promise.resolve(options.token(data)).catch((err) =>
						console.error('Card payment failed!', err)
					);
				}
			});

			void modal.onDidDismiss().then(() => options.closed());

			await modal.present();
		} finally {
			this.opening = false;
		}
	}
}
