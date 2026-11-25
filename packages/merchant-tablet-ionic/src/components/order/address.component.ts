import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ViewCell } from '../table-components/smart-table';
import User from '@modules/server.common/entities/User';

@Component({
	standalone: false,
	styles: [
		`
			h1 {
				font-weight: normal !important;
			}
			.address {
				font-style: italic !important;
				text-decoration: underline;
				display: block !important;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.Eager,
	template: `
		<strong
			>{{ user?.geoLocation.city }}
			<span *ngIf="user?.geoLocation.postcode"
				>({{ user?.geoLocation.postcode }})</span
			>
		</strong>
		<span *ngIf="user" class="address">{{
			getStoreFullAddress(user)
		}}</span>
	`,
})
export class AddressComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	user: User;

	ngOnInit(): void {
		this.user = this.rowData.user;
	}

	getStoreFullAddress(user: User) {
		const geoLocation = user.geoLocation;
		const fullAddress = `${geoLocation.city}, ${geoLocation.streetAddress} ${geoLocation.house}`;
		return fullAddress;
	}
}
