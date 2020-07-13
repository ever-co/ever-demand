import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import DeliveryType from '@modules/server.common/enums/DeliveryType';

@Component({
	selector: 'order-type',
	templateUrl: './order-type.component.html',
	styleUrls: ['./order-type.component.scss'],
})
export class OrderTypeComponent implements OnInit {
	@Output()
	orderTypeEmitter = new EventEmitter<DeliveryType>();

	ngOnInit() {}

	chooseOption(type: DeliveryType) {
		this.orderTypeEmitter.emit(type);
	}
}
