import { injectable } from 'inversify';
import Logger from 'bunyan';
import _ from 'lodash';
import { createEverLogger } from '../../helpers/Log';
import { routerName, asyncListener } from '@pyro/io';
import IService from '../IService';
import axios from 'axios';
import IGeoLocationsRouter from '@modules/server.common/routers/IGeoLocationsRouter';
import { env } from '../../env';
import { inspect } from 'util';

@injectable()
@routerName('geo-location')
export class GeoLocationsService implements IGeoLocationsRouter, IService {
	protected log: Logger = createEverLogger({
		name: 'GeoLocationsService',
	});

	private arcgisClientID: string;
	private arcgisClientSecret: string;

	constructor() {
		this.arcgisClientID = env.ARCGIS_CLIENT_ID;
		this.arcgisClientSecret = env.ARCGIS_CLIENT_SECRET;
	}

	@asyncListener()
	async getAddressByCoordinatesUsingArcGIS(
		lat: number,
		lng: number
	): Promise<any | null> {
		if (!this.arcgisClientID || !this.arcgisClientSecret) {
			this.log.info(
				`Cannot use getAddressByCoordinatesUsingArcGIS without${
					this.arcgisClientID ? '' : ' arcgisClientID'
				}${this.arcgisClientSecret ? '' : ' arcgisClientSecret'}`
			);

			return null;
		}

		try {
			this.log.info(
				`Attempt to reverse Geocode coordinates: ${lat},${lng}`
			);

			const tokenRequestUrl = `https://www.arcgis.com/sharing/oauth2/token?client_id=${this.arcgisClientID}&client_secret=${this.arcgisClientSecret}&grant_type=client_credentials&f=json`;

			const tokenResult = await axios.get(tokenRequestUrl);

			if (
				!tokenResult ||
				!tokenResult.data ||
				!tokenResult.data['access_token']
			) {
				this.log.info(
					`Cannot get arcgis token with client_id=${this.arcgisClientID}, client_secret=${this.arcgisClientSecret}`
				);
				return null;
			} else {
				const token = tokenResult.data['access_token'];

				// tslint:disable-next-line:max-line-length
				const requestBaseUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${lng}%2C${lat}&distance=200&f=json`;

				const requestUrl = `${requestBaseUrl}&forStorage=true&token=${token}`;

				const resp = await axios.get(requestUrl);

				if (
					resp &&
					resp.data &&
					resp.data['address'] &&
					(resp.data['address'].City ||
						resp.data['address'].Region ||
						resp.data['address'].Subregion)
				) {
					let locality: string;

					if (resp.data['address'].City) {
						locality = resp.data['address'].City;
					} else if (resp.data['address'].Subregion) {
						locality = resp.data['address'].Subregion;
					} else if (resp.data['address'].Region) {
						locality = resp.data['address'].Region;
					}

					const result = {
						locality,

						// replace removes numbers and trim spaces (they are usually wrong anyway!)
						thoroughfare: resp.data['address'].Address
							? resp.data['address'].Address.replace(
									/\d+|^\s+|\s+$/g,
									''
							  ).replace(
									/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
									''
							  )
							: null,
					};

					this.log.info(
						`Attempted to reverse Geocode coordinates: ${lat}, ${lng}. Got results: ` +
							`${JSON.stringify(result)}`
					);

					return result;
				} else {
					this.log.info(
						`Attempted to reverse Geocode coordinates: ${lat}, ${lng}. ` +
							`Got empty response: ${resp ? inspect(resp) : ''}`
					);
					return null;
				}
			}
		} catch (err) {
			// Do not report it as error because geo-coding may simply not work for given coordinates
			this.log.info(err);
			return null;
		}
	}
}
