import {
	ChangeDetectionStrategy,
	Component,
	Input,
	EventEmitter,
} from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Store } from 'app/services/store.service';
import { Stripe } from 'stripe';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { STRIPE_CURRENCY_CHANGED_ERROR } from '@modules/server.common/routers/IOrderRouter';
import { environment } from 'environments/environment';
import { ModalController } from '@ionic/angular/lazy';
import { TranslateService } from '@ngx-translate/core';
import { OrderPage } from '../../order.page';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'e-cu-payment',
	templateUrl: './payment.component.html',
	styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent {
	@Input()
	order: Order;
	@Input()
	modalChange: EventEmitter<boolean>;
	@Input()
	smallButtons: boolean;

	userCard: Stripe.Card | null = null;

	// Currency the server charges cards in (e.g. 'USD'), shown in the card
	// popup. Null until the server answered, so the popup never shows
	// another currency than the one charged.
	stripeCurrency: string | null = null;

	loadingStripeCurrency: boolean = false;

	// Pay now waits for the first currency load. After a failed load it is
	// enabled again, so a tap can tell the customer and load it again.
	get waitingForStripeCurrency(): boolean {
		return this.stripeCurrency == null && this.loadingStripeCurrency;
	}

	// True while a card payment request is in flight, so a double tap
	// does not send a second payment for the same order. It also covers
	// a payment that another PaymentComponent started for the current
	// order (see Store.isPaying), so a component created again while the
	// payment runs keeps its buttons disabled.
	get paying(): boolean {
		return this._paying || this.store.isPaying(this.store.orderId);
	}

	set paying(value: boolean) {
		this._paying = value;
	}

	private _paying: boolean = false;

	private stripePublishableKey: string = environment.STRIPE_PUBLISHABLE_KEY;

	constructor(
		private userRouter: UserRouter,
		private orderRouter: OrderRouter,
		private store: Store,
		public modalController: ModalController,
		private readonly _translateProductLocales: ProductLocalesService,
		private readonly _translateService: TranslateService
	) {
		this.getUserCard();
		// Never rejects: a failed load is logged, and Pay now loads it again
		void this.getStripeCurrency();
	}

	async payWithUserCard() {
		const orderId = this.store.orderId;

		if (this._paying || this.store.isPaying(orderId)) {
			return;
		}

		if (!this.stripePublishableKey) {
			throw Error("Can't pay in app");
		}

		if (this.userCard == null) {
			throw new Error('userCard is null');
		}

		this.paying = true;
		this.store.startPaying(orderId);

		try {
			return await this.orderRouter.payWithStripe(
				orderId,
				this.userCard.id
			);
		} catch (err) {
			// The card was declined, the server refused the order (already
			// paid or cancelled) or the socket dropped. The click handler
			// drops the returned promise, so tell the customer here and
			// resolve: a rejection would escape it unseen.
			this.tellCustomer('BUY_POPUP.PAYMENT_FAILED');
			console.error('Payment Failed!', err);
		} finally {
			this.paying = false;
			this.store.stopPaying(orderId);
		}
	}

	async toPaymentStage() {
		// A second card popup while the first new-card payment runs would
		// save another card and charge the order again under its id.
		if (this._paying || this.store.isPaying(this.store.orderId)) {
			return;
		}

		if (!this.stripePublishableKey) {
			throw Error("Can't pay in app");
		}

		// Loaded with the component, not here: the popup has to open
		// straight from the tap, without waiting on the network.
		const currency = this.stripeCurrency;

		if (currency == null) {
			if (!this.loadingStripeCurrency) {
				this.tellCustomer('BUY_POPUP.PAYMENT_FAILED');
				void this.getStripeCurrency();
			}
			return;
		}

		if (environment.ORDER_INFO_TYPE === 'popup') {
			this.modalController.dismiss();
		}

		const pay_text = 'Pay {{amount}}';

		// Checkout calls closed whenever its popup closes, also after a
		// successful token, and browsers differ in which callback runs
		// first. Whichever comes first opens the order info modal; the
		// other does nothing, so this Checkout session opens it once.
		let orderInfoShown = false;

		const close = () => {
			if (environment.ORDER_INFO_TYPE === 'popup' && !orderInfoShown) {
				orderInfoShown = true;
				this.showOrderInfoModal();
			}
		};

		const handler = (<any>window).StripeCheckout.configure({
			panelLabel: pay_text,
			key: this.stripePublishableKey,
			image: environment.STRIPE_POP_UP_LOGO,
			currency,
			allowRememberMe: false,
			token: async (token) => {
				const orderId = this.store.orderId;

				if (this._paying || this.store.isPaying(orderId)) {
					return;
				}

				// Set before the first await so the Pay now button is
				// disabled for the whole card save, charge and confirm.
				this.paying = true;
				this.store.startPaying(orderId);

				try {
					const user = await this.userRouter.updateEmail(
						this.store.userId,
						token['email'] as string
					);

					try {
						const cardId = await this.userRouter.addPaymentMethod(
							user.id,
							token.id
						);

						try {
							// The server refuses the charge when its currency
							// is no longer the one shown in this popup.
							let order = await this.orderRouter.payWithStripe(
								orderId,
								cardId,
								currency
							);
							console.log('Payment Done!');
							try {
								order = await this.orderRouter.confirm(orderId);
								console.log('Order Confirmed!');
							} catch (err) {
								console.error('Could not confirm the order!');
							}
						} catch (err) {
							this.tellCustomer('BUY_POPUP.PAYMENT_FAILED');
							console.error('Payment Failed!', err);

							if (err?.name === STRIPE_CURRENCY_CHANGED_ERROR) {
								// The setting changed since the currency was
								// loaded: Pay now waits for the new one, so
								// no popup shows the refused one again.
								this.stripeCurrency = null;
								void this.getStripeCurrency();
							}
						}
					} catch (err) {
						this.tellCustomer('BUY_POPUP.PAYMENT_FAILED');
						console.error('Payment Method creation failed!', err);
					}
				} catch (err) {
					// updateEmail fails when the email typed in Checkout
					// belongs to another customer. Tell the customer here,
					// because a rejection would escape the Stripe callback.
					// The message asks to check the email or use another
					// one; it does not say the email is taken, so it never
					// tells whether an email has an account.
					this.tellCustomer('BUY_POPUP.EMAIL_NOT_SAVED');
					console.error('Email update failed!', err);
				} finally {
					this.paying = false;
					this.store.stopPaying(orderId);
				}
				close();
			},

			closed: () => close(),
		});

		const currentOrderProduct = this.order.products[0];
		const currentProduct = currentOrderProduct.product;

		handler.open({
			name: this.localeTranslate(currentProduct.title),
			description: this.localeTranslate(currentProduct.description),
			amount: currentOrderProduct.price * 100,
		});
	}

	private async getUserCard() {
		const cards = await this.userRouter.getCards(this.store.userId);

		this.userCard = cards[0];
	}

	private async getStripeCurrency() {
		this.loadingStripeCurrency = true;

		try {
			const currency = await this.orderRouter.getStripeCurrency();

			this.stripeCurrency = currency.toUpperCase();
		} catch (err) {
			console.error('Could not load the card charge currency!', err);
		} finally {
			this.loadingStripeCurrency = false;
		}
	}

	private async showOrderInfoModal(): Promise<void> {
		const modal = await this.modalController.create({
			component: OrderPage,
			cssClass: 'order-info-modal',
			showBackdrop: true,
			componentProps: { modalChange: this.modalChange },
		});

		if (this.modalChange) {
			this.modalChange.emit(true);
		}

		return modal.present();
	}

	private localeTranslate(member: ILocaleMember[]): string {
		return this._translateProductLocales.getTranslate(member);
	}

	// Shows a BUY_POPUP message in the app language, never server error
	// text.
	private tellCustomer(key: string): void {
		alert(this._translateService.instant(key));
	}
}
