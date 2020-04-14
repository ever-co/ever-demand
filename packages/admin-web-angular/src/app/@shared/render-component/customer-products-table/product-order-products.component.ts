import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';

@Component({
	template: `
		<div class="product">
			<p class="text-center">
				<span (click)="redirect()" class="button-redirect productBtn">
					<img
						alt=""
						src="{{
							productInfo.warehouseProduct.product.images[0].url
						}}"
					/>
					<span class="productTitle">{{ productTitle }}</span>
				</span>
			</p>
		</div>
	`,
})
export class ProductOrderProductsComponent implements ViewCell, OnInit {
	value: string | number;
	productInfo: any;
	public productTitle: string;

	@Input()
	rowData: any;

	constructor(
		private readonly router: Router,
		private _productLocalesService: ProductLocalesService
	) {}

	ngOnInit(): void {
		this.productInfo = this.rowData;

		this.productTitle = this.localeTranslate(
			this.rowData.warehouseProduct.product.title
		);
	}

	protected localeTranslate(member: ILocaleMember[]) {
		return this._productLocalesService.getTranslate(member);
	}

	redirect() {
		if (this.productInfo) {
			this.router.navigate([
				`products/list/${this.productInfo.warehouseProduct['product'].id}`,
			]);
		}
	}
}
