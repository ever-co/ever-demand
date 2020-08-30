import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { first } from 'rxjs/operators';

const initializeProductsNumber: number = 10;

@Component({
	selector: 'e-cu-products-list-view',
	templateUrl: './list-view.component.html',
	styleUrls: ['./list-view.component.scss'],
})
export class ProductsListViewComponent implements OnInit {
	private static MAX_DESCRIPTION_LENGTH: number = 53;

	@Input()
	products: ProductInfo[] = [];

	@Input()
	placeholder: string;

	@Input()
	areProductsLoaded: boolean;

	@Input()
	productsCount: number;

	@Output()
	buy = new EventEmitter<ProductInfo>();

	@Input()
	$areProductsLoaded: EventEmitter<boolean>;

	@Output()
	goToDetailsPage = new EventEmitter<ProductInfo>();

	@Output()
	loadProducts = new EventEmitter<{
		count?: number;
		imageOrientation?: number;
	}>();

	imageOrientation: number = 0;
	onChange = new EventEmitter<boolean>();

	constructor(
		private readonly translateProductLocales: ProductLocalesService
	) {}

	get showProducts() {
		return this.products.filter((p) => p.warehouseProduct.count !== 0);
	}

	ngOnInit(): void {
		this.loadProducts.emit({
			count: initializeProductsNumber,
			imageOrientation: this.imageOrientation,
		});
	}

	shortenDescription(desc: string) {
		return desc.length < ProductsListViewComponent.MAX_DESCRIPTION_LENGTH
			? desc
			: desc.substr(
					0,
					ProductsListViewComponent.MAX_DESCRIPTION_LENGTH - 3
			  ) + '...';
	}

	localeTranslate(member: ILocaleMember[]): string {
		return this.translateProductLocales.getTranslate(member);
	}

	async loadData(event) {
		await this.loadProducts.emit({
			count: initializeProductsNumber,
			imageOrientation: this.imageOrientation,
		});

		await this.$areProductsLoaded.pipe(first()).toPromise();

		event.target.complete();
	}
}
