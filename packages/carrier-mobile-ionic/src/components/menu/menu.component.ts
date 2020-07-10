import { Component } from '@angular/core';
import { Store } from 'services/store.service';
import { environment } from 'environments/environment';
import { ModalController } from '@ionic/angular';
import { OrdersListComponent } from '../orders-list/orders-list.component';

@Component({
	selector: 'e-cu-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
	companyName: string;

	constructor(private store: Store, private modalCtrl: ModalController) {
		this.companyName = environment.APP_NAME;
	}

	get showInformationPage() {
		return this.store.showInformationPage;
	}

	menuOpened() {}

	async openOrdersListModal() {
		const modal = await this.modalCtrl.create({
			component: OrdersListComponent,
			cssClass: 'orders-list-modal',
		});
		await modal.present();
	}
}
