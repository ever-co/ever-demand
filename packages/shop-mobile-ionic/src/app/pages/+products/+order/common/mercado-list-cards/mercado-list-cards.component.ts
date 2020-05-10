import { Component, Input, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import Order from '@modules/server.common/entities/Order';
import User from '@modules/server.common/entities/User';
import { IMercadoSavedCard } from '@modules/server.common/interfaces/IPayment';
import { MercadoAcceptCardComponent } from '../mercado-accept-card/mercado-accept-card.component';

@Component({
	selector: 'e-cu-mercado-list-cards',
	templateUrl: './mercado-list-cards.component.html',
	styleUrls: ['./mercado-list-cards.component.scss'],
})
export class MercadoListCardComponent {
	@Input()
	order: Order;

	@Input()
	userCards?: IMercadoSavedCard[] = null;

	user: User;

	modalChange = new EventEmitter<boolean>();

	constructor(private modalController: ModalController) {
		this.modalChange.subscribe((value) => {
			if (!value) {
				this.close();
			}
		});
	}

	async acceptPayment(userCard?: IMercadoSavedCard) {
		const modal = await this.modalController.create({
			component: MercadoAcceptCardComponent,
			componentProps: {
				order: this.order,
				userCard: userCard,
				modalChange: this.modalChange,
			},
		});
		modal.present();
	}

	ngOnInit(): void {}

	async close() {
		await this.modalController.dismiss();
	}
}
