import { Injectable } from '@angular/core';
import { IInviteCreateObject } from '@modules/server.common/interfaces/IInvite';
import { Country } from '@modules/server.common/entities/GeoLocation';
import faker from 'faker';
import { environment } from 'environments/environment';

const NEED_DEFAULT_SETTINGS_MESSAGE =
	"Can't generate fake data without DEFAULT_LONGITUDE and DEFAULT_LATITUDE";
const lng = environment['DEFAULT_LONGITUDE'];
const lat = environment['DEFAULT_LATITUDE'];

@Injectable()
export default class FakeDataInvites {
	get getHardcodedCreateObject() {
		if (lng && lat) {
			const a: IInviteCreateObject = {
				geoLocation: {
					city: 'אשדוד',
					postcode: '77452',
					streetAddress: 'העצמאות',
					house: '38',
					countryId: 1,
					loc: {
						type: 'Point',
						coordinates: [lng + 0.05, lat - 0.01],
					},
				},
				apartment: '3',
			};

			const b: IInviteCreateObject = {
				geoLocation: {
					city: 'אשדוד',
					postcode: '77452',
					streetAddress: 'העצמאות',
					house: '450',
					countryId: 1,
					loc: {
						type: 'Point',
						coordinates: [lng + 0.09, lat - 0.1],
					},
				},
				apartment: '2',
			};

			const c: IInviteCreateObject = {
				geoLocation: {
					city: 'Rishon LeTsiyon',
					postcode: '77452',
					streetAddress: 'Jabotinsky',
					house: '180',
					countryId: 1,
					loc: {
						type: 'Point',
						coordinates: [lng, lat - 0.01],
					},
				},
				apartment: '6',
			};

			const d: IInviteCreateObject = {
				geoLocation: {
					city: 'Rishon LeTsiyon',
					postcode: '77452',
					streetAddress: 'Jabotinsky',
					house: '190',
					countryId: 1,
					loc: {
						type: 'Point',
						coordinates: [lng + 0.06, lat],
					},
				},
				apartment: '6',
			};

			return { a, b, c, d };
		} else {
			console.warn(NEED_DEFAULT_SETTINGS_MESSAGE);
			return;
		}
	}

	getCreateObject(): IInviteCreateObject {
		if (lng && lat) {
			return {
				geoLocation: {
					city: faker.address.city(),
					postcode: faker.address.zipCode(),
					streetAddress: faker.address.streetAddress(),
					house: faker.random.number(199).toString(),
					countryId: faker.random.number(1) as Country,
					loc: {
						type: 'Point',
						coordinates: [lng, lat],
					},
				},
				apartment: faker.random.number(199).toString(),
			};
		} else {
			console.warn(NEED_DEFAULT_SETTINGS_MESSAGE);
			return;
		}
	}
}
