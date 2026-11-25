import { OnInit, Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
	styleUrls: ['carrier-image.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: 'carrier-image.component.html',
})
export class CarrierImageComponent implements ViewCell, OnInit {
	value: any;
	rowData: any;
	imageUrl: string;
	redirectPage: string;

	constructor(private readonly router: Router) {}

	ngOnInit() {
		this.imageUrl = this.rowData.image;
	}

	redirect() {
		if (this.redirectPage) {
			this.router.navigate([`${this.redirectPage}/${this.rowData.id}`]);
		}
	}
}
