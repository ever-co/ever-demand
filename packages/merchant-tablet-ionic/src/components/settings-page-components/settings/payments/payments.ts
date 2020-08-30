import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import Warehouse from '@modules/server.common/entities/Warehouse';
import PaymentGateways, {
	paymentGatewaysToString,
	paymentGatewaysLogo,
} from '@modules/server.common/enums/PaymentGateways';
import { ModalController } from '@ionic/angular';
import { PaymentMutationComponent } from './mutation/mutation';
import { ConfirmDeletePopupPage } from 'components/confirm-delete-popup/confirm-delete-popup';
import { countriesDefaultCurrencies } from '@modules/server.common/entities/Currency';
import { Country } from '@modules/server.common/entities';
import { first } from 'rxjs/operators';

@Component({
	selector: 'merchant-payments-settings',
	templateUrl: 'payments.html',
	styleUrls: ['payments.scss'],
})
export class SettingsPaymentsComponent implements OnInit {
	@Input()
	currWarehouse: Warehouse;

	showPaymentsGateways: boolean;
	hasChanged: boolean;
	myPaymentsGateways = [];
	paymentsGateways = [];
	selectedMyPaymentsGateways: PaymentGateways[];
	selectedPaymentsGateways: PaymentGateways[];

	constructor(public modalCtrl: ModalController) {}

	ngOnInit(): void {
		const merchantPaymentsGateways = this.currWarehouse.paymentGateways.map(
			(mpg) => mpg.paymentGateway
		);
		const allPaymentGateways = Object.values(PaymentGateways).filter(
			(r) => !isNaN(<number>r)
		);

		if (merchantPaymentsGateways) {
			this.myPaymentsGateways = allPaymentGateways.filter((pg) =>
				merchantPaymentsGateways.includes(<PaymentGateways>pg)
			);
		}

		this.paymentsGateways = allPaymentGateways.filter(
			(pg) => !this.myPaymentsGateways.includes(pg)
		);

		this.showPaymentsGateways = true;
	}

	get isValid() {
		return (
			this.hasChanged &&
			(!this.currWarehouse.isPaymentEnabled ||
				this.myPaymentsGateways.length > 0)
		);
	}

	getPaymentName(pg: PaymentGateways) {
		return paymentGatewaysToString(pg);
	}

	getPaymentLogo(pg: PaymentGateways) {
		return paymentGatewaysLogo(pg);
	}

	async showMutation(e) {
		const paymentGateway = this.currWarehouse.paymentGateways.find(
			(pg) => pg.paymentGateway === e
		);

		const modal = await this.modalCtrl.create({
			component: PaymentMutationComponent,
			componentProps: {
				configureObject:
					paymentGateway && paymentGateway.configureObject,
				paymentGateway: e,
				defaultCompanyBrandLogo: this.currWarehouse.logo,
				defaultCurrency:
					countriesDefaultCurrencies[
						Country[this.currWarehouse.geoLocation.countryId]
					],
			},
			cssClass: 'payments-mutation-wrapper',
		});

		await modal.present();

		const { data } = await modal.onDidDismiss();

		if (data) {
			const res = await data.pipe(first()).toPromise();

			this.currWarehouse.paymentGateways = this.currWarehouse.paymentGateways.filter(
				(pg) => pg.paymentGateway !== res.paymentGateway
			);
			this.currWarehouse.paymentGateways.push(res);

			this.myPaymentsGateways = this.myPaymentsGateways.filter(
				(pg) => pg !== res.paymentGateway
			);
			this.myPaymentsGateways.push(res.paymentGateway);

			this.paymentsGateways = this.paymentsGateways.filter(
				(pg) => pg !== res.paymentGateway
			);
			this.hasChanged = true;
		}

		this.selectedMyPaymentsGateways = [];
		this.selectedPaymentsGateways = [];
	}

	async confirmRemovePaymentGateway(pg: PaymentGateways) {
		const modal = await this.modalCtrl.create({
			component: ConfirmDeletePopupPage,
			componentProps: {
				data: {
					image: this.getPaymentLogo(pg),
					name: this.getPaymentName(pg),
				},
				isRemove: true,
			},
			cssClass: 'confirm-delete-wrapper',
		});

		await modal.present();

		const res = await modal.onDidDismiss();

		if (res.data) {
			this.removePaymentGateway(pg);
		}
	}

	private removePaymentGateway(pg) {
		this.paymentsGateways = [...this.paymentsGateways, pg];

		this.myPaymentsGateways = this.myPaymentsGateways.filter(
			(existedPG) => existedPG !== pg
		);
		this.currWarehouse.paymentGateways = this.currWarehouse.paymentGateways.filter(
			(existedPG) => existedPG.paymentGateway !== pg
		);
		this.hasChanged = true;
	}
}
