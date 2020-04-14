import { Component, Input, OnInit, EventEmitter } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { getIdFromTheDate } from '@modules/server.common/utils';

@Component({
	template: `
		<button class="btn btn-sm btn-outline-secondary" (click)="redirect()">
			{{ orderId }}
		</button>
	`,
})
export class RedirectOrderComponent implements ViewCell, OnInit {
	value: string | number;
	orderId: string;

	@Input()
	rowData: any;

	constructor(private readonly router: Router) {}

	ngOnInit() {
		this.orderId = getIdFromTheDate(this.rowData);
	}

	redirect() {
		if (this.rowData.id) {
			this.router.navigate([`orders/${this.rowData.id}`]);
		}
	}
}
