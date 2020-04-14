import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import GeoLocation from '@modules/server.common/entities/GeoLocation';

@Component({
	templateUrl: './map-modal.component.html',
	styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnDestroy {
	origin: GeoLocation;
	destination: GeoLocation;

	constructor(public modalController: ModalController) {}

	closeModal() {
		this.modalController.dismiss();
	}

	ngOnDestroy(): void {
		console.warn('MapModalComponent destroyed');
	}
}
