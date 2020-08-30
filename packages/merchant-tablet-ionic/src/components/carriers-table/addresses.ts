import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Carrier from '@modules/server.common/entities/Carrier';
import { ModalController } from '@ionic/angular';
import { CarrierAddrPopupPage } from 'pages/+carriers/carrier-addr-popup/carrier-addr-popup';
import { CarrierTrackPopup } from 'pages/+carriers/carrier-track-popup/carrier-track-popup';

@Component({
	styles: [``],
	template: `
		<span class="underlined" (click)="showAddress(carrier)">
			{{ carrier.geoLocation.city }}
			<span *ngIf="carrier.geoLocation.postcode">{{
				'(' + carrier.geoLocation.postcode + ')'
			}}</span>
		</span>
	`,
})
export class AddressesComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	carrier: Carrier;

	constructor(public modalCtrl: ModalController) {}

	ngOnInit(): void {
		this.carrier = this.rowData.carrier;
	}

	async showAddress(carrier) {
		const modal = await this.modalCtrl.create({
			component: CarrierTrackPopup,
			componentProps: { carrier },
			cssClass: 'carrier-track-wrapper',
		});
		await modal.present();
	}
}
