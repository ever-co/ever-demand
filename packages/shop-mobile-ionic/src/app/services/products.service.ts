import { Injectable } from '@angular/core';
import { WarehouseProductsService } from 'app/services/merchants/warehouse-products';
import { Router } from '@angular/router';
import ProductInfo from '@modules/server.common/entities/ProductInfo';

@Injectable()
export class ProductsService {
	constructor(
		private warehouseProductsService: WarehouseProductsService,
		private router: Router
	) {}

	async goToDetailsPage(
		product: ProductInfo,
		listOfProducts?: ProductInfo[]
	) {
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
			if (listOfProducts) {
				const loadedProduct = listOfProducts.find(
					(p) => p.warehouseProduct.id === product.warehouseProduct.id
				);
				if (loadedProduct) {
					loadedProduct['soldOut'] = true;
				}
			}
		}
	}
}
