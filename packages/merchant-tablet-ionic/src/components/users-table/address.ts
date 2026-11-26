import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ViewCell } from '../table-components/smart-table';
import User from '@modules/server.common/entities/User';
import { ModalController } from '@ionic/angular/lazy';
import { CustomerAddrPopupPage } from '../../pages/+customers/customer-addr-popup/customer-addr-popup';

@Component({
	standalone: false,
	styles: [``],
	changeDetection: ChangeDetectionStrategy.Eager,
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
