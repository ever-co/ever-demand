import { Query, Resolver } from '@nestjs/graphql';
import { GeoLocationsProductsService } from '../../services/geo-locations';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { first } from 'rxjs/operators';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';

@Resolver('GeoLocation')
export class GeoLocationResolver {
	constructor(
		private readonly geoLocationsProductsService: GeoLocationsProductsService
	) {}

	@Query('geoLocationProducts')
	async getGeoLocationProducts(
		_,
		{ geoLocation }: { geoLocation: GeoLocation }
	) {
		return this.geoLocationsProductsService
			.get(geoLocation)
			.pipe(first())
			.toPromise();
	}

	@Query()
	async geoLocationProductsByPaging(
		_,
		{
			geoLocation,
			options,
			pagingOptions = {}
		}: {
			geoLocation;
			options?: { isDeliveryRequired?: boolean; isTakeaway?: boolean };
			pagingOptions;
		}
	) {
		return this.geoLocationsProductsService.geoLocationProductsByPaging(
			geoLocation,
			pagingOptions,
			options
		);
	}
	@Query()
	async getCountOfGeoLocationProducts(
		_,
		{
			geoLocation,
			options
		}: {
			geoLocation: IGeoLocation;
			options?: { isDeliveryRequired?: boolean; isTakeaway?: boolean };
		}
	) {
		return this.geoLocationsProductsService.getCountOfGeoLocationProducts(
			geoLocation,
			options
		);
	}
}
