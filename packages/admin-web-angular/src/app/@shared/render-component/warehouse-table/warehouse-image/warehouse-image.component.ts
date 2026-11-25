import { OnInit, Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ViewCell } from '@app/@shared/smart-table';

@Component({
	standalone: false,
	styleUrls: ['warehouse-image.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	templateUrl: 'warehouse-image.component.html',
})
export class WarehouseImageComponent implements ViewCell, OnInit {
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
