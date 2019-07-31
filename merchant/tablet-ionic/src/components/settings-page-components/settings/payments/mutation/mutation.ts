import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import PaymentGateways, {
	paymentGatewaysToString
} from '@modules/server.common/enums/PaymentGateways';
import { first } from 'rxjs/operators';
import { CurrenciesService } from 'services/currencies.service';

@Component({
	selector: 'merchant-payments-mutation',
	templateUrl: 'mutation.html',
	styleUrls: ['mutation.scss']
})
export class PaymentMutationComponent {
	configureObject: any;
	paymentGateway: PaymentGateways;

	currenciesCodes: string[] = [];

	constructor(
		public modalController: ModalController,
		private currenciesService: CurrenciesService
	) {
		this.loadCurrenciesCodes();
	}

	cancelModal() {
		this.modalController.dismiss();
	}

	get titleText() {
		return `${
			this.configureObject ? 'Update' : 'Add'
		}  ${paymentGatewaysToString(this.paymentGateway)} gateway`;
	}

	private async loadCurrenciesCodes() {
		const res = await this.currenciesService
			.getCurrencies()
			.pipe(first())
			.toPromise();

		if (res) {
			this.currenciesCodes = res.map((r) => r.currencyCode);
		}
	}
}
