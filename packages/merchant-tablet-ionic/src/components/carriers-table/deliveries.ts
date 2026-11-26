import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ViewCell } from '../table-components/smart-table';
import Carrier from '@modules/server.common/entities/Carrier';
import { ModalController } from '@ionic/angular/lazy';
import { CarrierDeliveriesPopupPage } from '../../pages/+carriers/carrier-deliveries-popup/carrier-deliveries-popup';

@Component({
	standalone: false,
	styles: [``],
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<div class="text-center">
			<ion-icon name="information-circle"
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
