import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import User from '@modules/server.common/entities/User';
import { ModalController } from '@ionic/angular';
import { CustomerAddrPopupPage } from 'pages/+customers/customer-addr-popup/customer-addr-popup';

@Component({
	styles: [``],
	template: `
		<span class="underlined" (click)="showAddress(user)">
			{{ user.geoLocation.city }}
			<span *ngIf="user.geoLocation.postcode">{{
				'(' + user.geoLocation.postcode + ')'
			}}</span>
		</span>
	`,
})
export class AddressComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	user: User;

	constructor(public modalCtrl: ModalController) {}

	ngOnInit(): void {
		this.user = this.rowData.user;
	}

	async showAddress(user: User) {
		const modal = await this.modalCtrl.create({
			component: CustomerAddrPopupPage,
			componentProps: { user },
			cssClass: 'customer-address-popup',
		});
		await modal.present();
	}
}
