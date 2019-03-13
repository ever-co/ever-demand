import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Carrier from '@modules/server.common/entities/Carrier';
import { ModalController } from '@ionic/angular';
import { CarrierAddrPopupPage } from 'pages/+carriers/carrier-addr-popup/carrier-addr-popup';

@Component({
	styles: [``],
	template: `
		<span class="underlined" (click)="showAddress(carrier.geoLocation)">
			{{ carrier.geoLocation.city }}
			<span *ngIf="carrier.geoLocation.postcode">{{
				'(' + carrier.geoLocation.postcode + ')'
			}}</span>
		</span>
	`
})
export class AddressesComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	carrier: Carrier;

	constructor(public modalCtrl: ModalController) {}

	ngOnInit(): void {
		this.carrier = this.rowData.carrier;
	}

	async showAddress(geoLocation) {
		const modal = await this.modalCtrl.create({
			component: CarrierAddrPopupPage,
			componentProps: { geoLocation },
			cssClass: 'carrier-address-popup'
		});
		await modal.present();
	}
}
