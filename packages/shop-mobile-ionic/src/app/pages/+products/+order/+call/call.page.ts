import { Component, EventEmitter } from '@angular/core';
import { PopoverController, ModalController, NavParams } from '@ionic/angular';

@Component({
	selector: 'e-cu-call',
	templateUrl: './call.page.html',
	styleUrls: ['./call.page.scss'],
})
export class CallPage {
	public modalChange: EventEmitter<boolean>;

	constructor(
		public readonly popoverCtrl: PopoverController,
		public modalController: ModalController,
		private readonly navParams: NavParams
	) {
		this.modalChange = navParams.get('modalChange');
	}

	async closePopup() {
		if (this.modalChange) {
			this.modalChange.emit(false);
		}

		await this.modalController.dismiss();
	}
}
