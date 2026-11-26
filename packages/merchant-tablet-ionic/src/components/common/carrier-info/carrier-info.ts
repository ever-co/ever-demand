import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import IOrder from '@modules/server.common/interfaces/IOrder';
import { ModalController } from '@ionic/angular/lazy';
import { OrderMapPopupPage } from '../../order-map-popup/order-map-popup';

@Component({
	standalone: false,
	selector: 'carrier-info',
	styleUrls: ['./carrier-info.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: 'carrier-info.html',
})
export class CarrierInfoComponent {
	@Input()
	public order: IOrder;

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
