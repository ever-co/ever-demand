import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

export interface IConfirmDeleteData {
	image: string;
	name: string;
	status?: string;
	phone?: string;
	addresses: string;
}

@Component({
	selector: 'confirm-delete-popup',
	templateUrl: 'confirm-delete-popup.html',
	styleUrls: ['./confirm-delete-popup.scss'],
})
export class ConfirmDeletePopupPage {
	@Input()
	data: IConfirmDeleteData;
	@Input()
	isRemove: boolean;

	constructor(public modalCtrl: ModalController) {}

	cancelModal() {
		this.modalCtrl.dismiss();
	}

	async confirmDelete() {
		this.modalCtrl.dismiss(true);
	}
}
