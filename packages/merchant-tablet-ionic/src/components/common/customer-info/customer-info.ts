import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import UserOrder from '@modules/server.common/entities/UserOrder';

@Component({
	standalone: false,
	selector: 'customer-info',
	styleUrls: ['./customer-info.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: 'customer-info.html',
})
export class CustomerInfoComponent {
	@Input()
	public user: UserOrder;

	constructor() {}

	get userFullName() {
		const fullName = `${this.user.firstName || ''} ${
			this.user.lastName || ''
		}`;
		return fullName.trim();
	}

	get fullAddress() {
		return (
			`${this.user.geoLocation.city}, ${this.user.geoLocation.streetAddress} ` +
			`${this.user.geoLocation.house}` +
			`${this.user.apartment ? '/' + this.user.apartment : ''}`
		);
	}
}
