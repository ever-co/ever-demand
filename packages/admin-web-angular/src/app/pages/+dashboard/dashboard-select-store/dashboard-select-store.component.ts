import { Component, Input, EventEmitter, Output } from '@angular/core';
import Warehouse from '@modules/server.common/entities/Warehouse';

@Component({
	selector: 'ea-dashboard-select-store',
	templateUrl: './dashboard-select-store.component.html',
	styleUrls: ['./dashboard-select-store.component.scss'],
})
export class DashboardSelectStoreComponent {
	@Input()
	stores: Warehouse[];

	@Output()
	selectedStoreEmitter = new EventEmitter<Warehouse>();

	selectedStore: Warehouse;

	constructor() {}

	selectNewStore(ev) {
		let storeId;
		if (ev) {
			storeId = ev.id;
			this.selectedStore = this.stores.find((s) => s.id === storeId);
		} else {
			this.selectedStore = null;
		}

		this.selectedStoreEmitter.emit(storeId);
	}
}
