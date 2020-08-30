import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import User from '@modules/server.common/entities/User';
import { ModalController } from '@ionic/angular';
import { CustomerEmailPopupPage } from 'pages/+customers/customer-email-popup/customer-email-popup';

@Component({
	template: `
		<div class="text-center">
			<ion-icon
				*ngIf="user.email"
				name="mail"
				class="mail-icon icon icon-md ion-md-mail"
				(click)="presentCustomerEmailPopup(user)"
			>
			</ion-icon>
		</div>
	`,
})
export class EmailComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	user: User;

	constructor(public modalCtrl: ModalController) {}

	ngOnInit(): void {
		this.user = this.rowData.user;
	}

	async presentCustomerEmailPopup(user: User) {
		const modal = await this.modalCtrl.create({
			component: CustomerEmailPopupPage,
			componentProps: { user },
			cssClass: 'customer-email',
		});
		await modal.present();
	}
}
