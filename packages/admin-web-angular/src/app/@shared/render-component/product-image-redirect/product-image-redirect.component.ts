import { OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewCell } from 'ng2-smart-table';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	styles: ['img { cursor: pointer }'],
	template: ` <img src="{{ imageUrl }}" (click)="redirect()" width="60" /> `,
})
export class ProductImageRedirectComponent implements ViewCell, OnInit {
	value: any;
	rowData: any;

	imageUrl: string;

	constructor(
		private readonly _router: Router,
		private readonly _localeTranslate: ProductLocalesService
	) {}

	ngOnInit() {
		this.imageUrl = this._localeTranslate.getTranslate(
			this.rowData.product.images
		);
	}

	redirect() {
		const productId = this.rowData.id;
		this._router.navigate(['products/list/' + productId]);
	}
}
