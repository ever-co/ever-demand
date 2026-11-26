import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular/modal-controller';

export interface IConfirmDeleteData {
	image: string;
	name: string;
	status?: string;
	phone?: string;
	addresses: string;
}

@Component({
	standalone: false,
	selector: 'confirm-delete-popup',
	templateUrl: 'confirm-delete-popup.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./confirm-delete-popup.scss'],
})
export class ConfirmDeletePopupPage {
	@Input()
	data: IConfirmDeleteData;
	@Input()
	isRemove: boolean;
	@Input()
	customText: string;

	constructor(public modalCtrl: ModalController) {}

	cancelModal() {
		this.modalCtrl.dismiss();
	}

	async confirmDelete() {
		this.modalCtrl.dismiss(true);
	}
}
