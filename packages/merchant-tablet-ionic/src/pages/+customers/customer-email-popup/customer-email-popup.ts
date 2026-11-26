import {
	Component,
	Input,
	OnInit,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ExternalAppsService } from '../../../services/native/external-apps.service';
import { LoadingController } from '@ionic/angular/loading-controller';
import { ModalController } from '@ionic/angular/modal-controller';

@Component({
	standalone: false,
	selector: 'customer-email-popup',
	templateUrl: 'customer-email-popup.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	styleUrls: ['./customer-email-popup.scss'],
})
export class CustomerEmailPopupPage implements OnInit {
	@Input()
	user: any;

	email: any;

	constructor(
		public loadingCtrl: LoadingController,
		private externalApps: ExternalAppsService,
		public modalController: ModalController,
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
