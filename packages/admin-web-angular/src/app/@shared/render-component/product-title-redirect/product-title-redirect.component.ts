import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewCell } from 'ng2-smart-table';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	styles: ['a { float: left; }', 'a:hover { color: #4caf508f !important; }'],
	template: ` <a (click)="redirect()">{{ title }}</a> `,
})
export class ProductTitleRedirectComponent implements ViewCell, OnInit {
	value: any;
	rowData: any;

	title: string;

	constructor(
		private readonly _router: Router,
		private readonly _localeTranslate: ProductLocalesService,
		private translate: TranslateService
	) {}

	ngOnInit() {
		this.title = this._localeTranslate.getTranslate(
			this.rowData.product.title
		);
	}

	redirect() {
		const productId = this.rowData.id;
		this._router.navigate(['products/list/' + productId]);
	}
}
