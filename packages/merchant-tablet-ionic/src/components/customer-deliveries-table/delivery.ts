import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Order from '@modules/server.common/entities/Order';

@Component({
	template: `
		<span>
			<div>{{ order._createdAt | date: 'short' }}</div>
			<div *ngIf="order.isCompleted">
				{{ getTotalDeliveryTime(order) }}
			</div>
		</span>
	`,
})
export class DeliveryComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	order: Order;

	constructor() {}

	ngOnInit(): void {
		this.order = this.rowData.order;
	}

	getTotalDeliveryTime(order: Order) {
		const start = order.createdAt;

		const end = new Date(order.deliveryTime);

		let delta = Math.abs(start.getTime() - end.getTime()) / 1000;

		const days = Math.floor(delta / 86400);
		delta -= days * 86400;

		const hours = Math.floor(delta / 3600) % 24;
		delta -= hours * 3600;

		const minutes = Math.floor(delta / 60) % 60;
		delta -= minutes * 60;

		const seconds = delta % 60;
		let secondsStr = seconds.toString();
		secondsStr = secondsStr.substring(0, secondsStr.indexOf('.'));

		let h = '0' + hours;
		h = h.substr(-2);
		let min = '0' + minutes;
		min = min.substr(-2);
		let sec = '0' + secondsStr;
		sec = sec.substr(-2);

		return `${days !== 0 ? days + 'days ' : ''}
            ${hours} : ${min} : ${sec}`;
	}
}
