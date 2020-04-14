import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import PaymentGateways, {
	paymentGatewaysToString,
} from '@modules/server.common/enums/PaymentGateways';
import { first } from 'rxjs/operators';
import { CurrenciesService } from 'services/currencies.service';
import { Subject } from 'rxjs';
import IPaymentGatewayCreateObject from '@modules/server.common/interfaces/IPaymentGateway';

@Component({
	selector: 'merchant-payments-mutation',
	templateUrl: 'mutation.html',
	styleUrls: ['mutation.scss'],
})
export class PaymentMutationComponent {
	defaultCompanyBrandLogo: string;
	defaultCurrency: string;
	configureObject: any;
	paymentGateway: PaymentGateways;
	currenciesCodes: string[] = [];
	paymentGateways = PaymentGateways;
	newConfigureObject = new Subject<IPaymentGatewayCreateObject>();
	isValid: boolean;

	constructor(
		public modalController: ModalController,
		private currenciesService: CurrenciesService
	) {
		this.loadCurrenciesCodes();
	}

	get titleText() {
		return `${
			this.configureObject ? 'Update' : 'Add'
		}  ${paymentGatewaysToString(this.paymentGateway)} gateway`;
	}

	cancelModal(newConfigureObject?: Subject<IPaymentGatewayCreateObject>) {
		this.modalController.dismiss(newConfigureObject);
	}

	updateConfigureObject(e) {
		this.newConfigureObject.next(e);
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
