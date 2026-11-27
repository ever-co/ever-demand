import { inject, injectable } from 'inversify';
import Logger from 'bunyan';
import { WarehousesService } from '../warehouses';
import Warehouse from '@modules/server.common/entities/Warehouse';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import _, { chain, clone, sortBy } from 'underscore';
import Utils from '@modules/server.common/utils';
import { createEverLogger } from '../../helpers/Log';
import { GeoLocationsWarehousesService } from './GeoLocationsWarehousesService';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import {
	observableListener,
	routerName,
	serialization,
	asyncListener,
} from '@pyro/io';
import IGeoLocationProductsRouter from '@modules/server.common/routers/IGeoLocationProductsRouter';
import IService from '../IService';
import { map } from 'rxjs/operators';
import {
	IProductTitle,
	IProductDescription,
	IProductDetails,
} from '@modules/server.common/interfaces/IProduct';
import type { IGetGeoLocationProductsOptions } from '../../graphql/geo-locations/geo-location.resolver';
import IWarehouseProduct from '@modules/server.common/interfaces/IWarehouseProduct';

@injectable()
@routerName('geo-location-products')
export class GeoLocationsProductsService
	implements IGeoLocationProductsRouter, IService {
	protected log: Logger = createEverLogger({
		name: 'geoLocationsProductsService',
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
		options?: IGetGeoLocationProductsOptions
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
		geoLocation: IGeoLocation,
		options?: IGetGeoLocationProductsOptions,
		searchText?: string
	): Promise<number> {
		try {
			const merchants = await this.geoLocationsWarehousesService.getMerchants(
				geoLocation,
				GeoLocationsWarehousesService.TrackingDistance,
				{
					fullProducts: true,
					activeOnly: true,
					merchantsIds: options ? options.merchantIds : null,
				}
			);
			// The shops page through geoLocationProductsByPaging (one row per
			// store offer) until they have loaded `count` rows, so count the
			// same rows: counting distinct products stopped the feed early
			// when nearby stores sold the same product.
			return this._getProductsFromWarehouses(
				new GeoLocation(geoLocation),
				merchants.map((m) => new Warehouse(m)),
				options,
				searchText
			).length;
		} catch (error) {
			return 0;
		}
	}

	@asyncListener()
	async geoLocationProductsByPaging(
		@serialization((g: IGeoLocation) => new GeoLocation(g))
		geoLocation: GeoLocation,
		pagingOptions,
		options?: IGetGeoLocationProductsOptions,
		searchText?: string
	): Promise<ProductInfo[]> {
		const merchants = await this.geoLocationsWarehousesService.getMerchants(
			geoLocation,
			GeoLocationsWarehousesService.TrackingDistance,
			{
				fullProducts: true,
				activeOnly: true,
				merchantsIds: options ? options.merchantIds : null,
			}
		);
		const products = this._getProductsFromWarehouses(
			geoLocation,
			merchants.map((m) => new Warehouse(m)),
			options,
			searchText
		);
		return products.slice(pagingOptions.skip).slice(0, pagingOptions.limit);
	}

	private _getProductsFromWarehouses(
		geoLocation: GeoLocation,
		warehouses: Warehouse[],
		options?: IGetGeoLocationProductsOptions,
		searchText?: string
	): ProductInfo[] {
		return chain(warehouses)
			.map((_warehouse: Warehouse) => {
				const warehouse = clone(_warehouse);
				// The shops hide offers that are not available; leave them out
				// here too, so the count matches the rows they show.
				warehouse.products = warehouse.products.filter(
					(wProduct: IWarehouseProduct) =>
						wProduct.isProductAvailable === true
				);
				if (!options || !options.withoutCount) {
					warehouse.products = warehouse.products.filter(
						(wProduct: IWarehouseProduct) => wProduct.count > 0
					);
				}
				if (options) {
					warehouse.products = warehouse.products.filter((wProduct: IWarehouseProduct) =>
						this.productsFilter(wProduct, options)
					);
				}
				warehouse.products = warehouse.products.filter((wProduct: IWarehouseProduct) =>
					this.filterBySearchText(wProduct, searchText)
				);
				return warehouse;
			}) // remove all warehouse products which count is 0.
			.map((warehouse: Warehouse) =>
				_.map(warehouse.products, (warehouseProduct) => {
					return new ProductInfo({
						warehouseId: warehouse._id.toString(),
						warehouseLogo: warehouse.logo,
						warehouseProduct,
						distance: Utils.getDistance(
							geoLocation,
							warehouse.geoLocation
						),
					});
				})
			)
			.flatten()
			.groupBy((productInfo) => productInfo.warehouseProduct.productId)
			.filter((productInfo) => !_.isUndefined(productInfo))
			.map((productInfos: ProductInfo[]) => sortBy(productInfos, 'distance'))
			.flatten()
			.value();
	}

	private productsFilter(wProduct, options) {
		if (!options) {
			return true;
		}

		wProduct.product.images = wProduct.product.images.filter((i) => {
			return (
				(options.imageOrientation !== undefined
					? options.imageOrientation === 1
						? i.orientation === 1
						: i.orientation === 0 || i.orientation === 2
					: true) &&
				(options.locale !== undefined
					? i.locale === options.locale
					: true)
			);
		});

		if (!wProduct.product.images || wProduct.product.images.length === 0) {
			return false;
		}

		return options.isDeliveryRequired
			? wProduct.isDeliveryRequired === options.isDeliveryRequired
			: true && options.isTakeaway
			? wProduct.isTakeaway === options.isTakeaway
			: true;
	}

	private filterBySearchText(wProduct, searchText) {
		if (!searchText) {
			return true;
		}

		let titles = wProduct.product['title'];
		titles = titles ? titles.map((t: IProductTitle) => t.value) : [];
		let descriptions = wProduct.product['description'];
		descriptions = descriptions
			? descriptions.map((d: IProductDescription) => d.value)
			: [];
		let details = wProduct.product['details'];
		details = details ? details.map((d: IProductDetails) => d.value) : [];

		return (
			(titles &&
				titles
					.join()
					.toLocaleLowerCase()
					.includes(searchText.toLocaleLowerCase())) ||
			(descriptions &&
				descriptions
					.join()
					.toLocaleLowerCase()
					.includes(searchText.toLocaleLowerCase())) ||
			(details &&
				details
					.join()
					.toLocaleLowerCase()
					.includes(searchText.toLocaleLowerCase()))
		);
	}
}
