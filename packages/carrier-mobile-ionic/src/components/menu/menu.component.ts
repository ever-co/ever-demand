import { Component } from '@angular/core';
import { Store } from 'services/store.service';
import { environment } from 'environments/environment';

@Component({
	selector: 'e-cu-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
	companyName: string;

	constructor(private store: Store) {
		this.companyName = environment.APP_NAME;
	}

	get showInformationPage() {
		return this.store.showInformationPage;
	}

	menuOpened() {}
}
