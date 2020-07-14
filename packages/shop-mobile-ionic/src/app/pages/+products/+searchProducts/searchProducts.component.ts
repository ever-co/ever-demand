import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import Warehouse from '@modules/server.common/entities/Warehouse';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import ProductInfo from '@modules/server.common/entities/ProductInfo';

import { MerchantsService } from 'app/services/merchants/merchants.service';
import { Store } from 'app/services/store.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { GeoLocationService } from 'app/services/geo-location';
import { Router } from '@angular/router';

import { environment } from 'environments/environment';
import { GeoLocationProductsService } from 'app/services/geo-location/geo-location-products';

@Component({
	selector: 'search-products',
	templateUrl: './searchProducts.component.html',
	styleUrls: ['./searchProducts.style.scss'],
})
export class SearchProductsComponent implements OnInit {
	searchInput: string;
	searchResultMerchants: Warehouse[];
	searchResultProducts: ProductInfo[];
	getOrdersGeoObj: { loc: ILocation };

	constructor(
		private merchantsService: MerchantsService,
		private store: Store,
		private userRouter: UserRouter,
		private geoLocationService: GeoLocationService,
		private geoLocationProductsService: GeoLocationProductsService,
		private router: Router
	) {}
	ngOnInit() {
		this.loadGeoLocationProducts();
	}

	async loadProducts() {
		await this.geoLocationProductsService
			.geoLocationProductsByPaging(this.getOrdersGeoObj, {
				skip: 0,
				limit: 100,
			})
			.pipe(first())
			.subscribe((products: ProductInfo[]) => {
				this.filterProducts(products);
			});
	}

	filterProducts(products: ProductInfo[]) {
		if (products) {
			const filteredProducts = products.filter((product) => {
				const title = product.warehouseProduct.product['title'];

				const result = title.filter((t) =>
					t.value
						.toLowerCase()
						.includes(this.searchInput.toLowerCase())
				);
				if (result.length === 0) {
					return false;
				}
				return result;
			});
			this.searchResultProducts = filteredProducts;
			//  .filter(prod=>prod.warehouseProduct.isDeliveryRequired === !+this.store.deliveryType)
			// console.log(this.searchResultProducts)
		}
	}

	//  async loadSearchMerchants() {

	//     const location = await this.getLocation();

	//     this.searchResultMerchants = await this.merchantsService.getMerchantsBuyName(
	//         this.searchInput,
	//         { loc: location }
	//     );
	// }

	// private async getLocation() {
	// 	let location: ILocation;

	// 	const isProductionEnv = environment.production;

	// 	if (this.store.userId && isProductionEnv) {
	// 		const user = await this.userRouter
	// 			.get(this.store.userId)
	// 			.pipe(first())
	// 			.toPromise();

	// 		location = {
	// 			type: 'Point',
	// 			coordinates: user.geoLocation.loc.coordinates,
	// 		};
	// 	} else {
	// 		const findGeoLocation = await this.geoLocationService.getCurrentGeoLocation();
	// 		location = {
	// 			type: 'Point',
	// 			coordinates: findGeoLocation.loc.coordinates,
	// 		};
	// 	}

	// 	return location;
	// }

	private async loadGeoLocationProducts() {
		let geoLocationForProducts: GeoLocation;
		const isProductionEnv = environment.production;

		if (this.store.userId && isProductionEnv) {
			const user = await this.userRouter
				.get(this.store.userId)
				.pipe(first())
				.toPromise();

			geoLocationForProducts = user.geoLocation;
		} else {
			try {
				geoLocationForProducts = await this.geoLocationService.getCurrentGeoLocation();
			} catch (error) {
				console.warn(error);
				this.store.registrationSystem = RegistrationSystem.Once;
				this.router.navigate(['/invite']);
			}
		}

		if (geoLocationForProducts) {
			this.getOrdersGeoObj = {
				loc: {
					type: 'Point',
					coordinates: geoLocationForProducts.loc.coordinates,
				},
			};
		}
	}
}
