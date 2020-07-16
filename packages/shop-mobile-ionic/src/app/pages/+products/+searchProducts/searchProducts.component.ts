import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { first } from 'rxjs/operators';

import Warehouse from '@modules/server.common/entities/Warehouse';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import RegistrationSystem from '@modules/server.common/enums/RegistrationSystem';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import DeliveryType from '@modules/server.common/enums/DeliveryType';
import { MerchantsService } from 'app/services/merchants/merchants.service';
import { Store } from 'app/services/store.service';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { GeoLocationService } from 'app/services/geo-location';
import { Router } from '@angular/router';
import { ProductLocalesService } from '@modules/client.common.angular2/locale/product-locales.service';
import { ILocaleMember } from '@modules/server.common/interfaces/ILocale';

import { environment } from 'environments/environment';
import { GeoLocationProductsService } from 'app/services/geo-location/geo-location-products';
import { WarehouseProductsService } from 'app/services/merchants/warehouse-products';

@Component({
	selector: 'search-products',
	templateUrl: './searchProducts.component.html',
	styleUrls: ['./searchProducts.style.scss'],
})
export class SearchProductsComponent implements OnInit {
	private static MAX_DESCRIPTION_LENGTH: number = 100;
	private loadingOrdersLimit: number = 6;
	private loadingMerchantsLimit: number = 5;

	searchInput: string = '';
	searchResultMerchants: Warehouse[] = [];
	searchResultProducts: ProductInfo[] = [];
	getOrdersGeoObj: { loc: ILocation };

	constructor(
		private merchantsService: MerchantsService,
		private store: Store,
		private userRouter: UserRouter,
		private geoLocationService: GeoLocationService,
		private geoLocationProductsService: GeoLocationProductsService,
		private router: Router,
		private readonly translateProductLocales: ProductLocalesService,
		private warehouseProductsService: WarehouseProductsService
	) {}
	ngOnInit() {
		this.loadFullData();
	}

	async loadFullData() {
		await this.loadGeoLocationProducts();
		this.loadMerchants();
		this.loadProducts();
	}

	async loadMerchants() {
		const location = this.getOrdersGeoObj.loc;
		const merchants = await this.merchantsService.getMerchantsBuyName(
			this.searchInput,
			{ loc: location }
		);
		this.searchResultMerchants = merchants.slice(0, 5);
	}
	async loadMoreMerchants() {
		const location = this.getOrdersGeoObj.loc;
		const merchants = await this.merchantsService.getMerchantsBuyName(
			this.searchInput,
			{ loc: location }
		);
		merchants
			.slice(
				this.searchResultMerchants.length,
				this.searchResultMerchants.length + this.loadingMerchantsLimit
			)
			.map((merch) => this.searchResultMerchants.push(merch));
	}

	async loadProducts() {
		const isDeliveryRequired =
			this.store.deliveryType === DeliveryType.Delivery;
		const isTakeaway = this.store.deliveryType === DeliveryType.Takeaway;

		await this.geoLocationProductsService
			.geoLocationProductsByPaging(
				this.getOrdersGeoObj,
				{
					limit: this.loadingOrdersLimit,
					skip: 0,
				},
				{
					isDeliveryRequired,
					isTakeaway,
				},
				this.searchInput
			)
			.pipe(first())
			.subscribe((products) => {
				this.searchResultProducts = products;
				// products.map((pr) => this.searchResultProducts.push(pr));
			});
	}
	async loadMoreProducts() {
		const isDeliveryRequired =
			this.store.deliveryType === DeliveryType.Delivery;
		const isTakeaway = this.store.deliveryType === DeliveryType.Takeaway;

		await this.geoLocationProductsService
			.geoLocationProductsByPaging(
				this.getOrdersGeoObj,
				{
					limit: this.loadingOrdersLimit,
					skip: this.searchResultProducts.length,
				},
				{
					isDeliveryRequired,
					isTakeaway,
				},
				this.searchInput
			)
			.pipe(first())
			.subscribe((products) => {
				products.map((pr) => this.searchResultProducts.push(pr));
			});
	}

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
	localeTranslate(member: ILocaleMember[]): string {
		return this.translateProductLocales.getTranslate(member);
	}

	shortenDescription(desc: string) {
		return desc.length < SearchProductsComponent.MAX_DESCRIPTION_LENGTH
			? desc
			: desc.substr(
					0,
					SearchProductsComponent.MAX_DESCRIPTION_LENGTH - 3
			  ) + '...';
	}
	getProductImage(product) {
		return this.localeTranslate(product.warehouseProduct.product['images']);
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
			const loadedProduct = this.searchResultProducts.find(
				(p) => p.warehouseProduct.id === product.warehouseProduct.id
			);

			if (loadedProduct) {
				loadedProduct['soldOut'] = true;
			}
		}
	}
}
