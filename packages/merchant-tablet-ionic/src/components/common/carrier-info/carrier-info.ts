import { Component, Input } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { ModalController } from '@ionic/angular';
import { OrderMapPopupPage } from 'components/order-map-popup/order-map-popup';

@Component({
	selector: 'carrier-info',
	styleUrls: ['./carrier-info.scss'],
	templateUrl: 'carrier-info.html',
})
export class CarrierInfoComponent {
	@Input()
	public order: Order;

	constructor(public modalCtrl: ModalController) {}

	get fullName() {
		const fullName = `${this.order.carrier['firstName'] || ''} ${
			this.order.carrier['lastName'] || ''
		}`;
		return fullName.trim();
	}

	get fullAddress() {
		return (
			`${this.order.carrier['geoLocation'].city}, ${this.order.carrier['geoLocation'].streetAddress} ` +
			`${this.order.carrier['geoLocation'].house}` +
			`${
				this.order.carrier['apartment']
					? '/' + this.order.carrier['apartment']
					: ''
			}`
		);
	}

	async track() {
		const order = this.order;
		const modal = await this.modalCtrl.create({
			component: OrderMapPopupPage,
			componentProps: {
				order,
			},
			cssClass: 'order-map-popup',
		});

		await modal.present();
	}
}
