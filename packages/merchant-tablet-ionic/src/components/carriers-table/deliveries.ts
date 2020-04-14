import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Carrier from '@modules/server.common/entities/Carrier';
import { ModalController } from '@ionic/angular';
import { CarrierDeliveriesPopupPage } from 'pages/+carriers/carrier-deliveries-popup/carrier-deliveries-popup';

@Component({
	styles: [``],
	template: `
		<div class="text-center">
			<ion-icon
				ios="ios-information-circle"
				md="md-information-circle"
			></ion-icon>
		</div>
		<div class="text-center">
			<span class="underlined" (click)="showDeliveriesInfo(carrier)">
				{{
					carrier.deliveriesCountToday +
						'/' +
						carrier.numberOfDeliveries
				}}
			</span>
		</div>
	`,
})
export class DeliveriesComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	carrier: Carrier;

	constructor(public modalCtrl: ModalController) {}

	ngOnInit(): void {
		this.carrier = this.rowData.carrier;
	}

	async showDeliveriesInfo(carrier) {
		const modal = await this.modalCtrl.create({
			component: CarrierDeliveriesPopupPage,
			componentProps: { carrier },
			cssClass: 'carrier-deliveries',
		});
		await modal.present();
	}
}
