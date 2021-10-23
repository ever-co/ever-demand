import { Component, Input } from '@angular/core';
import UserOrder from '@modules/server.common/entities/UserOrder';

@Component({
	selector: 'customer-info',
	styleUrls: ['./customer-info.scss'],
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
