import { Component, OnInit, Input } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Carrier from '@modules/server.common/entities/Carrier';

@Component({
	styles: [
		`
			h1 {
				font-weight: normal;
			}
			.address {
				font-style: italic;
				text-decoration: underline;
				display: block;
			}
		`,
	],
	template: `
		<strong
			>{{ carrier?.geoLocation.city }}
			<span *ngIf="carrier?.geoLocation.postcode"
				>({{ carrier?.geoLocation.postcode }})</span
			>
		</strong>
		<span *ngIf="carrier" class="address">{{
			getStoreFullAddress(carrier)
		}}</span>
	`,
})
export class AddressComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	carrier: Carrier;

	ngOnInit(): void {
		this.carrier = this.rowData.carrier;
	}

	getStoreFullAddress(carrier: Carrier) {
		const geoLocation = carrier.geoLocation;
		const fullAddress = `${geoLocation.city}, ${geoLocation.streetAddress} ${geoLocation.house}`;
		return fullAddress;
	}
}
