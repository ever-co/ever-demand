import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GeoLocationsMerchantsService } from 'app/services/geo-location-merchants.service';
import { Store } from 'app/services/store.service';
import { first } from 'rxjs/operators';
import { UserRouter } from '@modules/client.common.angular2/routers/user-router.service';
import { GeoLocationService } from 'app/services/geo-location';
import Warehouse from '@modules/server.common/entities/Warehouse';
import { MerchantsService } from 'app/services/merchants/merchants.service';
import { ILocation } from '@modules/server.common/interfaces/IGeoLocation';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { WarehouseRouter } from '@modules/client.common.angular2/routers/warehouse-router.service';
import { environment } from 'environments/environment';

@Component({
	templateUrl: './merchants.page.html',
	styleUrls: ['./merchants.page.scss'],
})
export class MerchantsPage implements OnDestroy {
	merchants: Warehouse[];
	searchName: string;

	constructor(
		private router: Router,
		private geoLocationsMerchantsService: GeoLocationsMerchantsService,
		private store: Store,
		private userRouter: UserRouter,
		private geoLocationService: GeoLocationService,
		private merchantsService: MerchantsService,
		private warehouseRouter: WarehouseRouter
	) {
		this.loadCloseMerchants();
	}

	goToProductPage() {
		this.router.navigateByUrl('products');
	}

	searchChange(event) {
		if (this.searchName) {
			this.loadSearchMerchants();
		} else {
			this.loadCloseMerchants();
		}
	}

	async selectMerchant(merchant) {
		this.store.inStore = merchant.id;
		this.router.navigateByUrl('products');
	}

	async scanQR() {
		try {
			const data = await BarcodeScanner.scan();
			this.loadScanedMerchant(data.text);
		} catch (error) {
			alert(error);
			console.log('Error', error);
		}
	}

	ngOnDestroy(): void {
		console.warn('MerchantsPage destroy');
	}

	private async loadCloseMerchants() {
		const location = await this.getLocation();

		this.merchants = await this.geoLocationsMerchantsService
			.getCoseMerchants({ loc: location })
			.pipe(first())
			.toPromise();
	}

	private async loadSearchMerchants() {
		const location = await this.getLocation();
		this.merchants = await this.merchantsService.getMerchantsBuyName(
			this.searchName,
			{ loc: location }
		);
	}

	private async loadScanedMerchant(id: string) {
		const merchant = await this.warehouseRouter
			.get(id)
			.pipe(first())
			.toPromise();

		this.searchName = merchant.name;
	}

	private async getLocation() {
		let location: ILocation;

		const isProductionEnv = environment.production;

		if (this.store.userId && isProductionEnv) {
			const user = await this.userRouter
				.get(this.store.userId)
				.pipe(first())
				.toPromise();

			location = {
				type: 'Point',
				coordinates: user.geoLocation.loc.coordinates,
			};
		} else {
			const findGeoLocation = await this.geoLocationService.getCurrentGeoLocation();
			location = {
				type: 'Point',
				coordinates: findGeoLocation.loc.coordinates,
			};
		}

		return location;
	}
}
