import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	styles: [
		`
			.paid-icon {
				color: green;
				margin-right: 3px;
			}
			.closed-icon {
				color: red;
				margin-right: 3px;
			}
			.actions-invites-requests {
				width: 6rem;
			}
		`,
	],
	template: `
		<div
			*ngIf="paid || closed"
			class="text-center actions-invites-requests"
		>
			<i *ngIf="paid" class="ion-md-checkmark paid-icon"></i>
			<i *ngIf="closed" class="ion-md-close closed-icon"></i> {{ text }}
		</div>
	`,
})
export class StatusComponent implements ViewCell, OnInit {
	value: string | number;
	@Input()
	rowData: any;
	paid: boolean;
	closed: boolean;

	text: string;

	checkOrderField: string;

	constructor() {}

	ngOnInit() {
		if (this.checkOrderField === 'isPaid') {
			this.paid = this.rowData.isPaid;
		} else {
			this.closed = this.rowData.isCancelled;
		}
	}
}
