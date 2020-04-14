import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'no-orders-info',
	templateUrl: 'no-orders-info.component.html',
	styleUrls: ['./no-orders-info.component.scss'],
})
export class NoOrdersInfoComponent {
	@Input()
	filterMode: string;

	@Output()
	toggleOrderContainer: EventEmitter<boolean> = new EventEmitter();
}
