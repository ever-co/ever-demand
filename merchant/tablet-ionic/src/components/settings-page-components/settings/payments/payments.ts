import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import Warehouse from '@modules/server.common/entities/Warehouse';
import PaymentGateways, {
	paymentGatewaysToString,
	paymentGatewaysLogo
} from '@modules/server.common/enums/PaymentGateways';
import { ModalController } from '@ionic/angular';
import { PaymentMutationComponent } from './mutation/mutation';

@Component({
	selector: 'merchant-payments-settings',
	templateUrl: 'payments.html'
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
			(r) => !isNaN(r)
		);

		if (merchantPaymentsGateways) {
			this.myPaymentsGateways = allPaymentGateways.filter((pg) =>
				merchantPaymentsGateways.includes(pg)
			);
		}

		this.paymentsGateways = allPaymentGateways.filter(
			(pg) => !this.myPaymentsGateways.includes(pg)
		);

		this.showPaymentsGateways = true;
	}

	getPaymentName(p: PaymentGateways) {
		return paymentGatewaysToString(p);
	}

	getPaymentLogo(p: PaymentGateways) {
		return paymentGatewaysLogo(p);
	}

	async showMutation(e) {
		const modal = await this.modalCtrl.create({
			component: PaymentMutationComponent,
			componentProps: {
				configureObject: this.currWarehouse.paymentGateways.find(
					(pg) => pg.paymentGateway === e
				),
				paymentGateway: e
			},
			cssClass: 'payments-mutation-wrapper'
		});

		await modal.present();

		await modal.onDidDismiss();

		this.selectedMyPaymentsGateways = [];
		this.selectedPaymentsGateways = [];
	}
}
