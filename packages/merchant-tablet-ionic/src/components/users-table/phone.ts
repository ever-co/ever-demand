import { Component, OnInit, Input } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { Store } from '../../services/store.service';
import { CallNumber } from '@ionic-native/call-number/ngx';
import User from '@modules/server.common/entities/User';

@Component({
	selector: 'user-phone',
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
	user: User;

	constructor(private store: Store, public callNumber: CallNumber) {}

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
			this.callNumber
				.callNumber(phone, true)
				.then((res) => console.warn('Called number!', res))
				.catch((err) => console.log('Error calling number!', err));
		}
	}
}
