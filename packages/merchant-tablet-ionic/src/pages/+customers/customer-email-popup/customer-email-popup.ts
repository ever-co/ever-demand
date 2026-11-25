import { Component, Input, OnInit } from '@angular/core';
import { ExternalAppsService } from '../../../services/native/external-apps.service';
import { LoadingController, ModalController } from '@ionic/angular/lazy';

@Component({
	standalone: false,
	selector: 'customer-email-popup',
	templateUrl: 'customer-email-popup.html',
	styleUrls: ['./customer-email-popup.scss'],
})
export class CustomerEmailPopupPage implements OnInit {
	@Input()
	user: any;

	email: any;

	constructor(
		public loadingCtrl: LoadingController,
		private externalApps: ExternalAppsService,
		public modalController: ModalController
	) {}

	attemptSendMail() {
		if (this.email) {
			this.externalApps.email({ to: this.email });
		}
	}

	ngOnInit(): void {
		this.email = this.user.email;
	}

	cancelModal() {
		this.modalController.dismiss();
	}
}
