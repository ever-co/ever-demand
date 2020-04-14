import { StorageService } from '@modules/server.common/StorageService';
import Order from '@modules/server.common/entities/Order';
import GeoLocation from '@modules/server.common/entities/GeoLocation';
import User from '@modules/server.common/entities/User';
import { generateObjectIdString } from '@modules/server.common/utils';
import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';

const lng = environment['DEFAULT_LONGITUDE'];
const lat = environment['DEFAULT_LATITUDE'];

@Injectable()
export class AdminStorageService extends StorageService {
	isConnected: boolean = false;

	order: Order | null = null;

	user: User | null = null;

	customerGeoLocation: GeoLocation =
		lng && lat
			? new GeoLocation({
					_id: generateObjectIdString(),
					_createdAt: new Date().toString(),
					_updatedAt: new Date().toString(),
					city: 'אשדוד',
					postcode: '77452',
					streetAddress: 'העצמאות',
					house: '38',
					countryId: 1,
					loc: {
						type: 'Point',
						coordinates: [lng, lat],
					},
			  })
			: null;
}
