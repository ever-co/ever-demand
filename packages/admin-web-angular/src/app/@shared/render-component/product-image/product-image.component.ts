import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	styleUrls: ['./product-image.component.scss'],
	templateUrl: './product-image.component.html',
})
export class ProductImageComponent {
	@Input()
	rowData: any;

	constructor(private router: Router) {}

	redirect() {
		this.router.navigate([`products/list/${this.rowData.id}/edit`]);
	}
}
