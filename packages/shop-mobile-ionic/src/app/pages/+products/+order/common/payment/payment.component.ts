import { Component, Input, EventEmitter } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { Store } from 'app/services/store.service';
import Stripe from 'stripe';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { environment } from 'environments/environment';
import { ModalController } from '@ionic/angular';
import { OrderPage } from '../../order.page';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
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

	userCard: Stripe.cards.ICard | null = null;

	private stripePublishableKey: string = environment.STRIPE_PUBLISHABLE_KEY;

	constructor(
		private userRouter: UserRouter,
		private orderRouter: OrderRouter,
		private store: Store,
		public modalController: ModalController,
		private readonly _translateProductLocales: ProductLocalesService
	) {
		this.getUserCard();
	}

	async payWithUserCard() {
		if (!this.stripePublishableKey) {
			throw Error("Can't pay in app");
		}

		if (this.userCard == null) {
			throw new Error('userCard is null');
		}

		return this.orderRouter.payWithStripe(
			this.store.orderId,
			this.userCard.id
		);
	}

	async toPaymentStage() {
		if (!this.stripePublishableKey) {
			throw Error("Can't pay in app");
		}

		if (environment.ORDER_INFO_TYPE === 'popup') {
			this.modalController.dismiss();
		}

		const pay_text = 'Pay {{amount}}';

		const close = () => {
			if (environment.ORDER_INFO_TYPE === 'popup') {
				this.showOrderInfoModal();
			}
		};

		const handler = (<any>window).StripeCheckout.configure({
			panelLabel: pay_text,
			key: this.stripePublishableKey,
			image: environment.STRIPE_POP_UP_LOGO,
			currency: 'ILS', // TODO: load currency from server!
			allowRememberMe: false,
			token: async (token) => {
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
						let order = await this.orderRouter.payWithStripe(
							this.store.orderId,
							cardId
						);
						console.log('Payment Done!');
						try {
							order = await this.orderRouter.confirm(
								this.store.orderId
							);
							console.log('Order Confirmed!');
						} catch (err) {
							console.error('Could not confirm the order!');
						}
					} catch (err) {
						alert('Payment Failed!');
						console.error('Payment Failed!', err);
					}
				} catch (err) {
					console.error('Payment Method creation failed!', err);
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
}
