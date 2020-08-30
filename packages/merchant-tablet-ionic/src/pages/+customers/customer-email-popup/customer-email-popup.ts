import { Component, Input, OnInit } from '@angular/core';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { LoadingController, ModalController } from '@ionic/angular';

@Component({
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
		private emailComposer: EmailComposer,
		public modalController: ModalController
	) {}

	attemptSendMail() {
		if (this.emailComposer.isAvailable()) {
			this.emailComposer.isAvailable().then((available: boolean) => {
				if (available) {
					const email = {
						to: this.email,
					};
					this.emailComposer.open(email);
				}
			});
		}
	}

	ngOnInit(): void {
		this.email = this.user.email;
	}

	cancelModal() {
		this.modalController.dismiss();
	}
}
