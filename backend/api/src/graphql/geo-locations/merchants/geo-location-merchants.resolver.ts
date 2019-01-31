import { Resolver, Query } from '@nestjs/graphql';
import { GeoLocationsWarehousesService } from '../../../services/geo-locations';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';
import Warehouse from '@modules/server.common/entities/Warehouse';
import Utils from '@modules/server.common/utils';
import GeoLocation from '@modules/server.common/entities/GeoLocation';

const IN_STORE_DISTANCE = 50;

@Resolver('GeoLocationMerchants')
export class GeoLocationMerchantsResolver {
	constructor(
		public geoLocationsWarehousesService: GeoLocationsWarehousesService
	) {}

	@Query('getCoseMerchants')
	async getCoseMerchants(_, { geoLocation }: { geoLocation: IGeoLocation }) {
		let merchants = await this.geoLocationsWarehousesService.getMerchants(
			geoLocation,
			IN_STORE_DISTANCE,
			{ fullProducts: false, activeOnly: true }
		);

		merchants = merchants.sort(
			(m1, m2) =>
				Utils.getDistance(
					new GeoLocation(m1.geoLocation),
					new GeoLocation(geoLocation)
				) -
				Utils.getDistance(
					new GeoLocation(m2.geoLocation),
					new GeoLocation(geoLocation)
				)
		);

		return merchants.map((m) => new Warehouse(m));
	}
}
