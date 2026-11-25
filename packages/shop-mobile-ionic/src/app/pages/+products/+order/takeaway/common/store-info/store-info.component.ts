import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	Input,
	Output,
	EventEmitter,
} from '@angular/core';
import Order from '@modules/server.common/entities/Order';
import { getCountryName } from '@modules/server.common/entities';
import { NativeService } from 'app/services/native/native.service';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { Store } from 'app/services/store.service';

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'e-cu-order-takeaway-info-store-info',
	templateUrl: './store-info.component.html',
	styleUrls: ['./store-info.component.scss'],
})
export class TakeawayStoreInfoComponent implements OnDestroy {
	@Input()
	order: Order;

	get warehouse(): Warehouse {
		if (this.order && this.order.warehouse) {
			return this.order.warehouse as Warehouse;
		} else {
			return null;
		}
	}

	@Input()
	lessInfo: boolean;

	@Output()
	openMap = new EventEmitter<boolean>();

	constructor(
		private store: Store,
		private readonly native: NativeService
	) {}

	get inStore() {
		return this.store.inStore;
	}

	get storeFullAddress(): string {
		if (this.order && this.order.warehouse) {
			const store = this.order.warehouse;

			return (
				`${store['geoLocation'].city}, ${store['geoLocation'].streetAddress} ` +
				`${store['geoLocation'].house}, ${
					store['geoLocation'].postcode
						? store['geoLocation'].postcode + ', '
						: ''
				} ${getCountryName(store['geoLocation'].countryId)}`
			);
		}
		return;
	}

	async attemptCall(phone) {
		try {
			this.native.callNumber(phone);
		} catch (err) {
			// TODO: implement popup notification
			console.warn('Call Was Unsuccessful!');
		}
	}

	ngOnDestroy(): void {}
}
