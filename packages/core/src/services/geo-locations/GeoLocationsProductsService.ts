import { inject, injectable } from 'inversify';
import Logger from 'bunyan';
import { WarehousesService } from '../warehouses';
import Warehouse from '@modules/server.common/entities/Warehouse';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import ProductInfo from '@modules/server.common/entities/ProductInfo';
import _ from 'lodash';
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
import { map, first } from 'rxjs/operators';
import IWarehouseProduct from '@modules/server.common/interfaces/IWarehouseProduct';
import {
	IProductTitle,
	IProductDescription,
	IProductDetails,
} from '@modules/server.common/interfaces/IProduct';
import WarehouseProduct from '@modules/server.common/entities/WarehouseProduct';
import { IGetGeoLocationProductsOptions } from 'graphql/geo-locations/geo-location.resolver';

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
			const productsIds = merchants.map((m) => {
				let products = m.products
					.filter((wProduct) =>
						this.productsFilter(wProduct, options)
					)
					.filter((wProduct) =>
						this.filterBySearchText(wProduct, searchText)
					);

				if (!options || !options.withoutCount) {
					products = products.filter(
						(wProduct) => wProduct.count > 0
					);
				}

				return products.map((p) => new WarehouseProduct(p).productId);
			});

			return (
				productsIds.flat().filter((x, i, a) => a.indexOf(x) == i)
					.length || 0
			);
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
		const underscore_: any = _; // TODO: remove sh..t
		return underscore_(warehouses)
			.map((_warehouse) => {
				const warehouse = _.clone(_warehouse);

				if (!options || !options.withoutCount) {
					warehouse.products = warehouse.products.filter(
						(wProduct) => wProduct.count > 0
					);
				}

				if (options) {
					warehouse.products = warehouse.products.filter((wProduct) =>
						this.productsFilter(wProduct, options)
					);
				}

				warehouse.products = warehouse.products.filter((wProduct) =>
					this.filterBySearchText(wProduct, searchText)
				);

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
						),
					});
				})
			)
			.flatten()
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
