import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import InviteRequest from '@modules/server.common/entities/InviteRequest';

@Component({
	styles: [
		'.invited-icon { color: green; margin-right: 3px;} .actions-invites-requests{width: 5rem;}',
	],
	template: `
		<div class="invited-date">
			{{ inviteRequest?.invitedDate | date: 'short' }}
		</div>
		<div class="invited-date"></div>
	`,
})
export class InvitedDateComponent implements ViewCell, OnInit {
	value: string | number;
	@Input()
	rowData: any;
	inviteRequest: InviteRequest;
	constructor() {}

	ngOnInit() {
		this.inviteRequest = this.rowData.inviteRequest;
	}
}
