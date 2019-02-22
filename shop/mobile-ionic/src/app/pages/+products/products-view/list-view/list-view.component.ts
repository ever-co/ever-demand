import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { Router } from '../../../../../../node_modules/@angular/router';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { Store } from 'app/services/store.service';
import { environment } from 'environment';

@Component({
	selector: 'e-cu-products-list-view',
	templateUrl: './list-view.component.html',
	styleUrls: ['./list-view.component.scss']
})
export class ProductsListViewComponent implements OnInit {
	private static MAX_DESCRIPTION_LENGTH: number = 53;

	@Input()
	public products: ProductInfo[] = [];

	@Input()
	placeholder: string;

	@Output()
	buy = new EventEmitter<ProductInfo>();

	constructor(
		private router: Router,
		private readonly translateProductLocales: ProductLocalesService,
		private readonly store: Store
	) {}

	ngOnInit(): void {
		const correctProducts = this.products.map((p: ProductInfo) => {
			const product = p;
			product.product['images'] = p.product['images'].filter(
				(i) =>
					(i.orientation === 0 || i.orientation === 2) &&
					(i.locale === this.store.language ||
						i.locale === environment.DEFAULT_LOCALE)
			);
			return product;
		});
		this.products = correctProducts.filter(
			(p) => p.product['images'].length > 0
		);
	}

	buyProduct(product: ProductInfo) {
		this.buy.emit(product);
	}
	shortenDescription(desc: string) {
		return desc.length < ProductsListViewComponent.MAX_DESCRIPTION_LENGTH
			? desc
			: desc.substr(
					0,
					ProductsListViewComponent.MAX_DESCRIPTION_LENGTH - 3
			  ) + '...';
	}
	goToDetailsPage(product: ProductInfo) {
		this.router.navigate(
			[
				`/products/product-details/${
					product.warehouseProduct.product['_id']
				}`
			],
			{
				queryParams: {
					backUrl: '/products',
					warehouseId: product.warehouseId
				}
			}
		);
	}

	sortByOrientation(i1, i2) {
		if (i1.orientation === 2 || i2.orientation === 2) {
			return i1.orientation < i2.orientation ? 1 : -1;
		}
		return i1.orientation === 0 ? -1 : 1;
	}

	localeTranslate(member: ILocaleMember[]): string {
		return this.translateProductLocales.getTranslate(member);
	}
}
