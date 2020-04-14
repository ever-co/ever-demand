import { Component, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'e-cu-order-info-header',
	templateUrl: './order-info-header.component.html',
	styles: [
		`
			.back-btn {
				font-size: 30px;
				margin-right: 10px;
				margin-bottom: 4px;
			}
		`,
	],
})
export class OrderInfoHeaderComponent {
	@Output()
	back = new EventEmitter<boolean>();
}
