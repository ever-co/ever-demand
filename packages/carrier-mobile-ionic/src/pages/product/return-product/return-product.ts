import { Component } from '@angular/core';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import ICarrier from '@modules/server.common/interfaces/ICarrier';
import IOrder from '@modules/server.common/interfaces/IOrder';
import { CarrierRouter } from '@modules/client.common.angular2/routers/carrier-router.service';
import { OrderRouter } from '@modules/client.common.angular2/routers/order-router.service';
import { first } from 'rxjs/operators';
import { Store } from 'services/store.service';
import { Router } from '@angular/router';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';

@Component({
	selector: 'page-return-product',
	templateUrl: 'return-product.html'
})
export class ReturnProductPage {
	carrier: ICarrier;
	selectedOrder: IOrder;

	constructor(
		private translateProductLocales: ProductLocalesService,
		private carrierRouter: CarrierRouter,
		private orderRouter: OrderRouter,
		private store: Store,
		private router: Router
	) {}

	get allowCancel() {
		switch (this.store.returnProductFrom) {
			case 'driveToWarehouse':
				return false;
			case 'startingDelivery':
				return this.selectedOrder && !this.selectedOrder.isCancelled;
			default:
				return false;
		}
	}

	ionViewWillEnter() {
		this.loadData();
	}

	localeTranslate(member: ILocaleMember[]) {
		return this.translateProductLocales.getTranslate(member);
	}

	cancelReturn() {
		if (!this.allowCancel) throw new Error('Cancel not allowed!');

		this.router.navigateByUrl('/main/starting-delivery', {
			skipLocationChange: false
		});
	}

	async returnProduct() {
		if (!this.selectedOrder.isCancelled) {
			await this.orderRouter.updateCarrierStatus(
				this.store.orderId,
				OrderCarrierStatus.IssuesDuringDelivery
			);

			this.unselectOrder();

			this.router.navigateByUrl('/main/home', {
				skipLocationChange: false
			});
		} else {
			this.unselectOrder();

			this.router.navigateByUrl('/main/home', {
				skipLocationChange: false
			});
		}
	}

	ionViewWillLeave() {
		localStorage.removeItem('returnProductFrom');
	}

	private async loadData() {
		this.carrier = await this.carrierRouter
			.get(this.store.carrierId)
			.pipe(first())
			.toPromise();

		this.selectedOrder = await this.orderRouter
			.get(this.store.orderId, {
				populateWarehouse: true
			})
			.pipe(first())
			.toPromise();
	}

	private unselectOrder() {
		localStorage.removeItem('orderId');
	}
}
