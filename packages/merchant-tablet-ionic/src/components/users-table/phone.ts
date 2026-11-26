import {
	Component,
	OnInit,
	Input,
	ChangeDetectionStrategy,
} from '@angular/core';
import { ViewCell } from '../table-components/smart-table';
import { Store } from '../../services/store.service';
import { ExternalAppsService } from '../../services/native/external-apps.service';
import UserOrder from '@modules/server.common/entities/UserOrder';

@Component({
	standalone: false,
	selector: 'user-phone',
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<ion-icon
			*ngIf="user.phone"
			name="call"
			class="call-icon icon icon-md ion-md-call"
			(click)="attemptCall(user.phone)"
			[ngClass]="canCall ? 'can-call' : 'can-not-call'"
		>
		</ion-icon>

		<span>{{ user.phone || '' }}</span>
	`,
})
export class UserPhoneComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;

	@Input()
	user: UserOrder;

	constructor(
		private store: Store,
		public externalApps: ExternalAppsService,
	) {}

	ngOnInit(): void {
		if (this.rowData) {
			this.user = this.rowData.user;
		}
	}

	get canCall() {
		if (this.store.platform) {
			return (
				this.store.platform.toLocaleLowerCase() === 'android' ||
				this.store.platform.toLocaleLowerCase() === 'ios'
			);
		}
		return false;
	}

	attemptCall(phone: string) {
		if (this.canCall) {
			this.externalApps
				.call(phone)
				.then((res) => console.warn('Called number!', res))
				.catch((err) => console.log('Error calling number!', err));
		}
	}
}
