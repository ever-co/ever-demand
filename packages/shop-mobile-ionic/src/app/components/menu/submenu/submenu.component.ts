import { Component, EventEmitter } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number';
import { environment } from 'environments/environment';
import { ModalController } from '@ionic/angular';
import { CallPage } from 'app/pages/+products/+order/+call/call.page';
import Warehouse from '@modules/server.common/entities/Warehouse';

@Component({
	selector: 'e-cu-submenu',
	templateUrl: './submenu.component.html',
	styleUrls: ['./submenu.component.scss'],
})
export class SubMenuComponent {
	merchant: Warehouse;

	private _ourSupportNumber = environment.SUPPORT_NUMBER;

	public modalChange: EventEmitter<boolean>;

	constructor(public modalController: ModalController) {}

	hasPhoneNumber() {
		return this._ourSupportNumber !== '' ? true : false;
	}

	async callUs() {
		try {
			await CallNumber.callNumber(this._ourSupportNumber, true);
		} catch (err) {
			// TODO: implement popup notification
			if (err) {
				const modal = this.modalController.create({
					component: CallPage,
					cssClass: 'order-info-modal',
					componentProps: { modalChange: this.modalChange },
				});
				return (await modal).present();
			}
			// console.error('Call Was Unsuccessful!');
		}
	}
}
