import {
	ChangeDetectionStrategy,
	Component,
} from '@angular/core';

@Component({
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
	selector: 'e-cu-invite',
	templateUrl: './invite.page.html',
	styleUrls: ['./invite.page.scss'],
})
export class InvitePage {}
