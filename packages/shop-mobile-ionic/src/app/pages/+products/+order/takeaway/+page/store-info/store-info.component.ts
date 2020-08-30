import {
	Component,
	OnInit,
	ViewChild,
	Input,
	EventEmitter,
	Output,
	OnDestroy,
} from '@angular/core';
import { ElapsedTimeComponent } from 'app/components/elapsed-time/elapsed-time.component';
import Order from '@modules/server.common/entities/Order';
import { ModalController } from '@ionic/angular';
import { DeliveryStatus } from '../../../order.page';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { Subject } from 'rxjs';
import { Store } from 'app/services/store.service';
import Warehouse from '@modules/server.common/entities/Warehouse';

@Component({
	selector: 'e-cu-order-store-info',
	templateUrl: './store-info.component.html',
	styleUrls: ['./store-info.component.scss'],
})
export class OrderStoreInfo implements OnInit, OnDestroy {
	@ViewChild('elapsedTime')
	elapsedTime: ElapsedTimeComponent;

	@Input()
	order: Order | null = null;

	@Input()
	paymentsEnabled: boolean;

	@Output()
	undo = new EventEmitter<boolean>();

	@Output()
	imHere = new EventEmitter<boolean>();
	@Output()
	complete = new EventEmitter<boolean>();

	get areIssues() {
		// TODO: implement
		return false;
	}

	// TODO: implement
	modalOpen: boolean;

	modalChange = new EventEmitter<boolean>();

	private readonly ngDestroy$ = new Subject<void>();

	constructor(
		public modalController: ModalController,
		private store: Store
	) {}

	ngOnInit(): void {
		console.warn('OrderStoreInfo Initialize.');
	}

	get currentStatus(): DeliveryStatus {
		if (this.order == null) {
			return DeliveryStatus.Warehouse;
		}

		if (this.order['isCompleted']) {
			return DeliveryStatus.Completed;
		} else if (
			this.order.carrierStatus >=
			OrderCarrierStatus.CarrierArrivedToCustomer
		) {
			return DeliveryStatus.Customer;
		} else if (
			this.order.carrierStatus >= OrderCarrierStatus.CarrierPickedUpOrder
		) {
			return DeliveryStatus.Carrier;
		} else {
			return DeliveryStatus.Warehouse;
		}
	}

	get warehouseLogo() {
		return (this.order.warehouse as Warehouse).logo;
	}

	get inStoreMode() {
		return this.store.inStore;
	}

	ngOnDestroy() {
		console.warn('OrderStoreInfo did leave');

		this.ngDestroy$.next();
		this.ngDestroy$.complete();
	}
}
