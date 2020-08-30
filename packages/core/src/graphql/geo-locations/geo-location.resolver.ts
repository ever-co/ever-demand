import { Query, Resolver } from '@nestjs/graphql';
import { GeoLocationsProductsService } from '../../services/geo-locations';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import { first } from 'rxjs/operators';
import IGeoLocation from '@modules/server.common/interfaces/IGeoLocation';

export interface IGetGeoLocationProductsOptions {
	isDeliveryRequired?: boolean;
	isTakeaway?: boolean;
	merchantIds?: string[];
	imageOrientation?: number;
	locale?: string;
	withoutCount?: boolean;
}

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
			pagingOptions = {},
			searchText,
		}: {
			geoLocation;
			options?: IGetGeoLocationProductsOptions;
			pagingOptions;
			searchText?: string;
		}
	) {
		return this.geoLocationsProductsService.geoLocationProductsByPaging(
			geoLocation,
			pagingOptions,
			options,
			searchText
		);
	}
	@Query()
	async getCountOfGeoLocationProducts(
		_,
		{
			geoLocation,
			options,
			searchText,
		}: {
			geoLocation: IGeoLocation;
			options?: IGetGeoLocationProductsOptions;
			searchText?: string;
		}
	) {
		return this.geoLocationsProductsService.getCountOfGeoLocationProducts(
			geoLocation,
			options,
			searchText
		);
	}
}
