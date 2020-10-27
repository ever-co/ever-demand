import { Component, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import Order from '@modules/server.common/entities/Order';

@Component({
	templateUrl: './order-info-modal.component.html',
	styleUrls: ['./order-info-modal.component.scss'],
})
export class OrderInfoModalComponent implements OnDestroy {
	order: Order;

	constructor(public modalController: ModalController) {}

	closeModal(buy) {
		this.modalController.dismiss(buy);
	}

	ngOnDestroy(): void {
		console.warn('OrderInfoModalComponent destroyed');
	}
}
