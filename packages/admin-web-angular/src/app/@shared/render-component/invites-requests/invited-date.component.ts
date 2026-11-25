import {
	Component,
	Input,
	OnInit,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ViewCell } from '@app/@shared/smart-table';
import InviteRequest from '@modules/server.common/entities/InviteRequest';

@Component({
	standalone: false,
	styles: [
		'.invited-icon { color: green; margin-right: 3px;} .actions-invites-requests{width: 5rem;}',
	],
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<div class="invited-date">
			{{
				$safeNavigationMigration(inviteRequest?.invitedDate)
					| date: 'short'
			}}
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
