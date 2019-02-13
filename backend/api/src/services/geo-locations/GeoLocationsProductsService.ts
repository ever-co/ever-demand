import { inject, injectable } from 'inversify';
import * as Logger from 'bunyan';
import { WarehousesService } from '../warehouses';
import Warehouse from '../../modules/server.common/entities/Warehouse';
import GeoLocation from '../../modules/server.common/entities/GeoLocation';
import ProductInfo from '../../modules/server.common/entities/ProductInfo';
import * as _ from 'lodash';
import Utils from '../../modules/server.common/utils';
import { createEverLogger } from '../../helpers/Log';
import { GeoLocationsWarehousesService } from './GeoLocationsWarehousesService';
import IGeoLocation from '../../modules/server.common/interfaces/IGeoLocation';
import {
	observableListener,
	routerName,
	serialization,
	asyncListener
} from '@pyro/io';
import IGeoLocationProductsRouter from '../../modules/server.common/routers/IGeoLocationProductsRouter';
import IService from '../IService';
import { map, first } from 'rxjs/operators';
import IWarehouseProduct from '@modules/server.common/interfaces/IWarehouseProduct';

@injectable()
@routerName('geo-location-products')
export class GeoLocationsProductsService
	implements IGeoLocationProductsRouter, IService {
	protected log: Logger = createEverLogger({
		name: 'geoLocationsProductsService'
	});

	constructor(
		@inject(WarehousesService)
		protected warehousesService: WarehousesService,
		@inject(GeoLocationsWarehousesService)
		protected geoLocationsWarehousesService: GeoLocationsWarehousesService
	) {}

	@observableListener()
	get(
		@serialization((g: IGeoLocation) => new GeoLocation(g))
		geoLocation: GeoLocation,
		options?: { isDeliveryRequired?: boolean; isTakeaway?: boolean }
	) {
		return this.geoLocationsWarehousesService
			.get(geoLocation, { fullProducts: true, activeOnly: true })
			.pipe(
				map((warehouses) =>
					this._getProductsFromWarehouses(
						geoLocation,
						warehouses,
						options
					)
				)
			);
	}

	@asyncListener()
	async getCountOfGeoLocationProducts(
		geoLocation: IGeoLocation
	): Promise<number> {
		const merchants = await this.geoLocationsWarehousesService.getMerchants(
			geoLocation,
			GeoLocationsWarehousesService.TrackingDistance,
			{ fullProducts: true, activeOnly: true }
		);

		return merchants
			.map((m) => m.products.length)
			.reduce((a, b) => a + b, 0);
	}

	@asyncListener()
	async geoLocationProductsByPaging(
		@serialization((g: IGeoLocation) => new GeoLocation(g))
		geoLocation: GeoLocation,
		pagingOptions
	): Promise<ProductInfo[]> {
		const merchants = await this.geoLocationsWarehousesService
			.get(geoLocation, { fullProducts: true, activeOnly: true })
			.pipe(first())
			.toPromise();

		const products = this._getProductsFromWarehouses(
			geoLocation,
			merchants
		);

		return products.slice(pagingOptions.skip).slice(0, pagingOptions.limit);
	}

	private _getProductsFromWarehouses(
		geoLocation: GeoLocation,
		warehouses: Warehouse[],
		options?: { isDeliveryRequired?: boolean; isTakeaway?: boolean }
	): ProductInfo[] {
		return _(warehouses)
			.map((_warehouse) => {
				const warehouse = _.clone(_warehouse);
				warehouse.products = warehouse.products.filter(
					(wProduct) => wProduct.count > 0
				);
				if (options) {
					warehouse.products = warehouse.products.filter((wProduct) =>
						options.isDeliveryRequired
							? wProduct.isDeliveryRequired ===
							  options.isDeliveryRequired
							: true && options.isTakeaway
							? wProduct.isTakeaway === options.isTakeaway
							: true
					);
				}
				return warehouse;
			}) // remove all warehouse products which count is 0.
			.map((warehouse) =>
				_.map(warehouse.products, (warehouseProduct) => {
					return new ProductInfo({
						warehouseId: warehouse.id,
						warehouseLogo: warehouse.logo,
						warehouseProduct,
						distance: Utils.getDistance(
							geoLocation,
							warehouse.geoLocation
						)
					});
				})
			)
			.flatten<ProductInfo>()
			.groupBy((productInfo) => productInfo.warehouseProduct.productId)
			.map((productInfos: ProductInfo[], productId) => {
				return _.minBy(
					productInfos,
					(productInfo) => productInfo.distance
				);
			})
			.filter((productInfo) => !_.isUndefined(productInfo))
			.map((productInfo) => productInfo as ProductInfo)
			.value();
	}
}
