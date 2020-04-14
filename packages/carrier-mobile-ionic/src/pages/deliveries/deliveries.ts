import { Component, OnDestroy } from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { Subject } from 'rxjs';
import { CarriersOrdersService } from '../../services/carriers-orders.service';
import { Store } from '../../services/store.service';

@Component({
	selector: 'page-deliveries',
	templateUrl: './deliveries.html',
	styleUrls: ['deliveries.scss'],
})
export class DeliveriesPage implements OnDestroy {
	currentCompletedOrders: Order[];

	private _ngDestroy$ = new Subject<void>();

	constructor(
		private readonly _carriersOrdersService: CarriersOrdersService,
		private readonly store: Store
	) {
		console.warn('DeliveriesPage loaded');

		this._getAllCompletedOrders();
	}

	private get _carrierId() {
		return this.store.carrierId;
	}

	ionViewCanEnter() {
		return this.store.carrierId !== null && !this.store.showInformationPage;
	}

	private async _getAllCompletedOrders() {
		this.currentCompletedOrders = await this._carriersOrdersService.getCarrierOrders(
			this._carrierId,
			{
				populateWarehouse: true,
				completion: 'all',
			}
		);

		console.warn('Orders - ' + this.currentCompletedOrders.length);
	}

	ngOnDestroy() {
		console.warn('DeliveriesPage leave');
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
