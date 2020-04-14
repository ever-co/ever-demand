import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
	styles: [
		'.invited-icon { color: green; margin-right: 3px;} .actions-invites-requests{width: 5rem;}',
	],
	template: `
		<div class="text-center actions-invites-requests">
			<i *ngIf="isInvited" class="ion-md-checkmark invited-icon"></i>
			{{ isInvited ? 'Invited' : 'Not Invited' }}
			<div></div>
		</div>
	`,
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
