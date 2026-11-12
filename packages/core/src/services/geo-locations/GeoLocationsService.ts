import { injectable } from 'inversify';
import Logger from 'bunyan';
import * as _ from 'lodash';
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

			// Credentials go in the POST body, never in the URL
			// (URLs end up in proxy/access logs and error traces).
			const tokenRequestBody = new URLSearchParams({
				client_id: this.arcgisClientID,
				client_secret: this.arcgisClientSecret,
				grant_type: 'client_credentials',
				f: 'json',
			}).toString();

			const tokenResult = await axios.post(
				'https://www.arcgis.com/sharing/oauth2/token',
				tokenRequestBody,
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				}
			);

			if (
				!tokenResult ||
				!tokenResult.data ||
				!tokenResult.data['access_token']
			) {
				this.log.info(
					`Cannot get arcgis token: status ${
						tokenResult ? tokenResult.status : 'unknown'
					}${this.describeTokenError(
						tokenResult ? tokenResult.data : null
					)}`
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
							`Got empty response: ${
								resp ? inspect(resp.data) : ''
							}`
					);
					return null;
				}
			}
		} catch (err) {
			// Do not report it as error because geo-coding may simply not work for given coordinates.
			// Never log the error object itself: axios errors carry the request config
			// (URL, headers, body), which includes credentials and tokens.
			this.log.info(
				`Reverse Geocode failed: ${this.describeRequestError(err)}`
			);
			return null;
		}
	}

	/**
	 * Short, credential-free reason from an ArcGIS token response body
	 * (ArcGIS reports failures as HTTP 200 with an `error` object).
	 */
	private describeTokenError(data: any): string {
		const error = data && data.error;
		if (!error) {
			return '';
		}
		const code = error.code ? ` ${this.redact(String(error.code))}` : '';
		const message =
			typeof error.message === 'string'
				? `: ${this.redact(error.message)}`
				: '';
		return ` (error${code}${message})`;
	}

	/**
	 * Status code and short reason only; redacts the configured credentials
	 * in case a message echoes them.
	 */
	private describeRequestError(err: any): string {
		const status =
			err && err.response && err.response.status
				? `status ${err.response.status}, `
				: '';
		const message =
			err && typeof err.message === 'string' ? err.message : 'unknown';
		return `${status}${this.redact(message)}`;
	}

	/**
	 * Replaces the configured credentials in any externally supplied text
	 * (provider or transport messages) and bounds its length before logging.
	 */
	private redact(text: string): string {
		let result = text;
		for (const secret of [this.arcgisClientSecret, this.arcgisClientID]) {
			if (secret) {
				result = result.split(secret).join('[redacted]');
			}
		}
		return result.length > 200 ? `${result.slice(0, 200)}...` : result;
	}
}
