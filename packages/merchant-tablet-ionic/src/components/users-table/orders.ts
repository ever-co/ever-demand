import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import User from '@modules/server.common/entities/User';
import Order from '@modules/server.common/entities/Order';
import { ModalController } from '@ionic/angular';
import { CustomerDeliveriesPopupPage } from 'pages/+customers/customer-deliveries-popup/customer-deliveries-popup';

@Component({
	template: `
		<div class="text-center">
			<span class="ordersCount" (click)="showDeliveriesInfo(user)">{{
				rowData?.orders
			}}</span>
			<div></div>
		</div>
	`,
})
export class OrdersComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	user: User;
	orders: Order[];

	constructor(public modalCtrl: ModalController) {}

	ngOnInit(): void {
		this.user = this.rowData.user;
		this.orders = this.rowData.allOrders;
	}

	getOrdersCount(userId: string) {
		return this.orders.filter((o: Order) => o.user.id === userId).length;
	}

	async showDeliveriesInfo(user) {
		const modal = await this.modalCtrl.create({
			component: CustomerDeliveriesPopupPage,
			componentProps: { user },
			cssClass: 'customer-deliveries',
		});
		await modal.present();
	}
}
