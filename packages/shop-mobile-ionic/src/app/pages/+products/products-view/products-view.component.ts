import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChange,
} from '@angular/core';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { Store } from '../../../services/store.service';
import { Router } from '@angular/router';
import { WarehouseProductsService } from 'app/services/merchants/warehouse-products';

@Component({
	selector: 'e-cu-products-view',
	templateUrl: './products-view.component.html',
	styleUrls: ['./products-view.component.scss'],
})
export class ProductsViewComponent implements OnChanges {
	@Input()
	products: ProductInfo[];

	@Input()
	areProductsLoaded: boolean;

	@Input()
	placeholder: string;

	@Input()
	productsCount: number;

	@Input()
	$areProductsLoaded: EventEmitter<boolean>;

	@Output()
	buy = new EventEmitter<ProductInfo>();

	@Output()
	loadProducts = new EventEmitter<{
		count?: number;
		imageOrientation?: number;
	}>();

	@Input()
	type: 'slides' | 'list';

	constructor(
		private store: Store,
		private router: Router,
		private warehouseProductsService: WarehouseProductsService
	) {}

	ngOnChanges({ products }: { products: SimpleChange }) {
		// This logic works when all products are loaded in the begin
		// if (!products || products.isFirstChange()) {
		// 	return;
		// }
		// const currentProducts = products.currentValue as ProductInfo[];
		// remove(currentProducts, (p) => p.product['images'].length > 0);
		// currentProducts.forEach((p) => {
		// 	p.product['images'] = p.product['images'].filter(
		// 		(i) =>
		// 			i.orientation === (this.type === 'list' ? 0 : 1) &&
		// 			i.locale === this.store.language
		// 	);
		// });
		// TODO debug - doesn't work
		/*setTimeout(() => {
			this.products = [ this.products[ 0 ], this.products[ 1 ] ];
		}, 2000);*/
		/*setTimeout(() => {
			this.products = [ this.products[ 1 ], this.products[ 2 ] ];
		}, 2000);*/
		// this._subscribeWarehouseProduct(products[ 0 ].warehouseId);
	}

	async goToDetailsPage(product: ProductInfo) {
		const prod = await this.warehouseProductsService.getWarehouseProduct(
			product.warehouseId,
			product.warehouseProduct.id
		);

		if (prod) {
			this.router.navigate(
				[
					`/products/product-details/${product.warehouseProduct.product['id']}`,
				],
				{
					queryParams: {
						backUrl: '/products',
						warehouseId: product.warehouseId,
					},
				}
			);
		} else {
			const loadedProduct = this.products.find(
				(p) => p.warehouseProduct.id === product.warehouseProduct.id
			);

			if (loadedProduct) {
				loadedProduct['soldOut'] = true;
			}
		}
	}
}
