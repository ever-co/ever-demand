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
			pagingOptions = {}
		}: {
			geoLocation;
			pagingOptions;
		}
	) {
		return this.geoLocationsProductsService.geoLocationProductsByPaging(
			geoLocation,
			pagingOptions
		);
	}
	@Query()
	async getCountOfGeoLocationProducts(
		_,
		{ geoLocation }: { geoLocation: IGeoLocation }
	) {
		return this.geoLocationsProductsService.getCountOfGeoLocationProducts(
			geoLocation
		);
	}
}
