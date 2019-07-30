import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import Warehouse from '@modules/server.common/entities/Warehouse';
import PaymentGateways, {
	paymentGatewaysToString,
	paymentGatewaysLogo
} from '@modules/server.common/enums/PaymentGateways';

@Component({
	selector: 'merchant-payments-settings',
	templateUrl: 'payments.html'
})
export class SettingsPaymentsComponent implements OnInit {
	@Input()
	currWarehouse: Warehouse;

	@ViewChild('isPaymentEnabled', { static: false })
	isPaymentEnabled: ElementRef;

	myPaymentsGateways = [];
	paymentsGateways = [];
	selectedMyPaymentsGateways: PaymentGateways[];
	selectedPaymentsGateways: PaymentGateways[];

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
	}

	getPaymentName(p: PaymentGateways) {
		return paymentGatewaysToString(p);
	}

	getPaymentLogo(p: PaymentGateways) {
		return paymentGatewaysLogo(p);
	}
}
