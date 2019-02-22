import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChange
} from '@angular/core';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import { remove } from 'lodash';
import { Store } from '../../../services/store.service';

@Component({
	selector: 'e-cu-products-view',
	templateUrl: './products-view.component.html',
	styleUrls: ['./products-view.component.scss']
})
export class ProductsViewComponent implements OnChanges {
	@Input()
	products: ProductInfo[];

	@Input()
	placeholder: string;

	@Output()
	buy = new EventEmitter<ProductInfo>();

	@Input()
	type: 'slides' | 'list';

	constructor(private store: Store) {}

	ngOnChanges({ products }: { products: SimpleChange }) {
		if (!products || products.isFirstChange()) {
			return;
		}

		const currentProducts = products.currentValue as ProductInfo[];

		remove(currentProducts, (p) => p.product['images'].length > 0);

		currentProducts.forEach((p) => {
			p.product['images'] = p.product['images'].filter(
				(i) =>
					i.orientation === (this.type === 'list' ? 0 : 1) &&
					i.locale === this.store.language
			);
		});

		// TODO debug - doesn't work
		/*setTimeout(() => {
			this.products = [ this.products[ 0 ], this.products[ 1 ] ];
		}, 2000);*/

		/*setTimeout(() => {
			this.products = [ this.products[ 1 ], this.products[ 2 ] ];
		}, 2000);*/

		// this._subscribeWarehouseProduct(products[ 0 ].warehouseId);
	}

	buyProduct(prod: ProductInfo) {
		this.buy.emit(prod);
	}
}
