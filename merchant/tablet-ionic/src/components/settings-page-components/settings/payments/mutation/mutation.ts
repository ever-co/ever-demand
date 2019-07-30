import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import PaymentGateways, {
	paymentGatewaysToString
} from '@modules/server.common/enums/PaymentGateways';

@Component({
	selector: 'merchant-payments-mutation',
	templateUrl: 'mutation.html',
	styleUrls: ['mutation.scss']
})
export class PaymentMutationComponent {
	configureObject: any;
	paymentGateway: PaymentGateways;

	constructor(public modalController: ModalController) {}

	cancelModal() {
		this.modalController.dismiss();
	}

	get titleText() {
		return `${
			this.configureObject ? 'Update' : 'Add'
		}  ${paymentGatewaysToString(this.paymentGateway)} gateway`;
	}
}
