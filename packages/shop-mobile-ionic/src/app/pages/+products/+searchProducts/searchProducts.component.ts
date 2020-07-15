import { Component, OnInit } from '@angular/core';
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

import { environment } from 'environments/environment';
import { GeoLocationProductsService } from 'app/services/geo-location/geo-location-products';

@Component({
	selector: 'search-products',
	templateUrl: './searchProducts.component.html',
	styleUrls: ['./searchProducts.style.scss'],
})
export class SearchProductsComponent implements OnInit {
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
		private router: Router
	) {}
	ngOnInit() {
		this.loadFullData();
	}

	async loadFullData() {
		await this.loadGeoLocationProducts();
		this.loadMerchants();
		this.loadProducts();
		console.log(this.searchResultProducts);
	}

	async loadMerchants() {
		const location = this.getOrdersGeoObj.loc;
		const merchants = await this.merchantsService.getMerchantsBuyName(
			this.searchInput,
			{ loc: location }
		);
		this.searchResultMerchants = merchants.slice(0, 5);
	}

	async loadProducts() {
		const isDeliveryRequired =
			this.store.deliveryType === DeliveryType.Delivery;
		const isTakeaway = this.store.deliveryType === DeliveryType.Takeaway;

		await this.geoLocationProductsService
			.geoLocationProductsByPaging(
				this.getOrdersGeoObj,
				{ limit: 20 },
				{
					isDeliveryRequired,
					isTakeaway,
				},
				this.searchInput
			)
			.pipe(first())
			.subscribe((products) => {
				this.searchResultProducts = products;
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
}
