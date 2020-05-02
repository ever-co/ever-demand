import { Component, Input, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import Order from '@modules/server.common/entities/Order';
import { IMercadoSavedCard } from '@modules/server.common/interfaces/IPayment';
import { Store } from 'app/services/store.service';
import { MercadoAcceptCardComponent } from '../mercado-accept-card/mercado-accept-card.component';
import { MercadoListCardComponent } from '../mercado-list-cards/mercado-list-cards.component';

@Component({
	selector: 'e-cu-mercado-payment',
	templateUrl: './mercado-payment.component.html',
	styleUrls: ['./mercado-payment.component.scss'],
})
export class MercadoPaymentComponent {
	@Input()
	order: Order;
	@Input()
	modalChange: EventEmitter<boolean>;
	@Input()
	smallButtons: boolean;

	userCards?: IMercadoSavedCard[] = null;
	loading = true;

	constructor(
		private userRouter: UserRouter,
		private store: Store,
		public modalController: ModalController
	) {
		this.getUserCard();
	}

	async payWithUserCard() {
		const modal = await this.modalController.create({
			component: MercadoListCardComponent,
			componentProps: { order: this.order, userCards: this.userCards },
		});
		modal.present();
	}

	// async payWithUserCard() {
	// 	const modal = await this.modalController.create({
	// 		component: MercadoAcceptCardComponent,
	// 		componentProps: { order: this.order },
	// 	});
	// 	modal.present();
	// }

	async acceptCard() {
		const modal = await this.modalController.create({
			component: MercadoAcceptCardComponent,
			componentProps: { order: this.order },
		});
		modal.present();
	}

	private async getUserCard() {
		const cards = await this.userRouter.getMercadoCards(this.store.userId);
		if (cards && cards.length > 0) {
			this.userCards = cards;
		}
		this.loading = false;
	}
}
