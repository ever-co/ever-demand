import { Component } from '@angular/core';
import { Store } from 'services/store.service';

@Component({
	selector: 'e-cu-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
	constructor(private store: Store) {}

	get maintenanceMode() {
		return this.store.maintenanceMode;
	}

	menuOpened() {}
}
