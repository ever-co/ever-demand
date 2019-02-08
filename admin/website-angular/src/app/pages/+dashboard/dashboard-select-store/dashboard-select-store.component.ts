import { Component, Input, EventEmitter, Output } from '@angular/core';
import Warehouse from '@modules/server.common/entities/Warehouse';

@Component({
	selector: 'ea-dashboard-select-store',
	templateUrl: './dashboard-select-store.component.html'
})
export class DashboardSelectStoreComponent {
	@Input()
	stores: Warehouse[];

	@Output()
	selectedStoreEmitter = new EventEmitter<Warehouse>();

	selectedStore: Warehouse;

	constructor() {}

	selectNewStore(ev) {
		const storeId = ev.target.value;
		this.selectedStore = this.stores.find((s) => s.id === storeId);

		this.selectedStoreEmitter.emit(storeId);
	}
}
