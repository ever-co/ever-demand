import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	styleUrls: ['./product-title.component.scss'],
	templateUrl: './product-title.component.html',
})
export class ProductTitleComponent {
	@Input()
	rowData: any;

	constructor(private router: Router) {}

	redirect() {
		this.router.navigate([`products/list/${this.rowData.id}/edit`]);
	}
}
