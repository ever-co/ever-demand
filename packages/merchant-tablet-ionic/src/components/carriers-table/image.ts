import { Component, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import Carrier from '@modules/server.common/entities/Carrier';
import { Store } from '../../services/store.service';

@Component({
	selector: 'carrier-image-view',
	styleUrls: ['./image.scss'],
	template: `
		<span class="image-component">
			<img *ngIf="carrier?.logo" src="{{ carrier.logo }}" />
		</span>
	`,
})
export class ImageComponent implements ViewCell, OnInit {
	value: string | number;
	rowData: any;
	carrier: Carrier;

	constructor(private store: Store) {}

	ngOnInit(): void {
		this.carrier = this.rowData.carrier;
	}
}
