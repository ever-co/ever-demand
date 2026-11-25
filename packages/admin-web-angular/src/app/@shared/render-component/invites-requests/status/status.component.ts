import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
	styles: [
		'.invited-icon { color: green; margin-right: 3px;} .actions-invites-requests{width: 5rem;}',
	],
	templateUrl: './status.component.html',
})
export class StatusComponent implements ViewCell, OnInit {
	value: string | number;
	@Input()
	rowData: any;
	isInvited: boolean;
	constructor() {}

	ngOnInit() {
		this.isInvited = this.rowData.isInvited;
	}
}
