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
import { ProductsService } from '../../../services/products.service';

@Component({
	selector: 'search-products',
	templateUrl: './searchProducts.component.html',
	styleUrls: ['./searchProducts.style.scss'],
})
export class SearchProductsComponent implements OnInit {
	private static MAX_DESCRIPTION_LENGTH: number = 100;
	private loadingProductsLimit: number = 10;
	private loadingMerchantsLimit: number = 5;

	isLoading: boolean = true;
	searchInput: string = '';
	searchResultMerchants: Warehouse[] = [];
	searchResultProducts: ProductInfo[] = [];
	geoObj: { loc: ILocation };

	merchantsShowMoreButton: boolean = false;
	productsShowMoreButton: boolean = false;

	constructor(
		private merchantsService: MerchantsService,
		private store: Store,
		private userRouter: UserRouter,
		private geoLocationService: GeoLocationService,
		private geoLocationProductsService: GeoLocationProductsService,
		private router: Router,
		private readonly translateProductLocales: ProductLocalesService,
		private productsService: ProductsService
	) {}
	ngOnInit() {
		this.loadFullData();
	}

	async loadFullData() {
		await this.loadGeoLocationProducts();
		this.onSearchChange();
	}

	async onSearchChange() {
		this.isLoading = true;
		await this.loadMerchants(true);
		await this.loadProducts(true);
		this.isLoading = false;
	}

	async loadMerchants(isNewList) {
		const location = this.geoObj.loc;
		const merchants = await this.merchantsService.getMerchantsBuyName(
			this.searchInput,
			{ loc: location }
		);

		isNewList
			? (this.searchResultMerchants = merchants.slice(
					0,
					this.loadingMerchantsLimit
			  ))
			: merchants
					.slice(
						this.searchResultMerchants.length,
						this.searchResultMerchants.length +
							this.loadingMerchantsLimit
					)
					.map((merch) => this.searchResultMerchants.push(merch));
		this.merchantsShowMoreButton =
			merchants.length === this.searchResultMerchants.length;
	}

	async loadProducts(isNewList) {
		const options = {
			isDeliveryRequired:
				this.store.deliveryType === DeliveryType.Delivery,
			isTakeaway: this.store.deliveryType === DeliveryType.Takeaway,
		};

		await this.geoLocationProductsService
			.geoLocationProductsByPaging(
				this.geoObj,
				{
					limit: this.loadingProductsLimit,
					skip: isNewList ? 0 : this.searchResultProducts.length,
				},
				options,
				this.searchInput
			)
			.pipe(first())
			.subscribe((products) => {
				isNewList
					? (this.searchResultProducts = products)
					: products.map((pr) => this.searchResultProducts.push(pr));
			});

		const orderCount = await this.geoLocationProductsService.getCountOfGeoLocationProducts(
			this.geoObj,
			options,
			this.searchInput
		);
		this.productsShowMoreButton =
			orderCount === this.searchResultProducts.length;
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
			this.geoObj = {
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
		await this.productsService.goToDetailsPage(
			product,
			this.searchResultProducts
		);
	}
}
