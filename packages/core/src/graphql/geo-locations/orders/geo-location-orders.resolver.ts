import { Resolver, Query } from '@nestjs/graphql';
import { GeoLocationsOrdersService } from '../../../services/geo-locations/GeoLocationsOrdersService';
import { GeoLocationOrdersOptions } from '../../../services/geo-locations/GeoLocationOrdersOptions';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import Order from '@modules/server.common/entities/Order';

@Resolver('GeoLocationOrders')
export class GeoLocationOrdersResolver {
	constructor(public geoLocationsOrdersService: GeoLocationsOrdersService) {}

	@Query('getOrderForWork')
	async getOrderForWork(
		_,
		{
			geoLocation,
			skippedOrderIds,
			options,
			searchObj,
		}: {
			geoLocation: IGeoLocation;
			skippedOrderIds: string[];
			options: GeoLocationOrdersOptions;
			searchObj?: {
				isCancelled?: boolean;
				byRegex?: Array<{ key: string; value: string }>;
			};
		}
	) {
		const orders = await this.geoLocationsOrdersService.getOrdersForWork(
			geoLocation,
			skippedOrderIds,
			options,
			searchObj
		);

		return orders[0];
	}

	@Query('getOrdersForWork')
	async getOrdersForWork(
		_,
		{
			geoLocation,
			skippedOrderIds,
			options,
			searchObj,
		}: {
			geoLocation: IGeoLocation;
			skippedOrderIds: string[];
			options: GeoLocationOrdersOptions;
			searchObj?: { byRegex: Array<{ key: string; value: string }> };
		}
	) {
		const orders = await this.geoLocationsOrdersService.getOrdersForWork(
			geoLocation,
			skippedOrderIds,
			options,
			searchObj
		);

		return orders.map((o) => new Order(o));
	}

	@Query()
	async getCountOfOrdersForWork(
		_,
		{
			geoLocation,
			skippedOrderIds,
			searchObj,
		}: {
			geoLocation: IGeoLocation;
			skippedOrderIds: string[];
			searchObj?: { byRegex: Array<{ key: string; value: string }> };
		}
	) {
		return this.geoLocationsOrdersService.getCountOfOrdersForWork(
			geoLocation,
			skippedOrderIds,
			searchObj
		);
	}
}
