import { Component, Output, EventEmitter, Input } from '@angular/core';

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
	@Input()
	title?: string;

	@Output()
	back = new EventEmitter<boolean>();
}
