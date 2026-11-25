import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ViewCell } from '../table-components/smart-table';
import Carrier from '@modules/server.common/entities/Carrier';
import { Store } from '../../services/store.service';

@Component({
	standalone: false,
	selector: 'carrier-image-view',
	styleUrls: ['./image.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
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
