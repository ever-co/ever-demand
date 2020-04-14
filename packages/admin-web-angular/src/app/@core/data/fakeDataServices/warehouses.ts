import { Injectable } from '@angular/core';
import { IGeoLocationCreateObject } from '@modules/server.common/interfaces/IGeoLocation';
import { Country } from '@modules/server.common/entities/GeoLocation';
import ForwardOrdersMethod from '@modules/server.common/enums/ForwardOrdersMethod';
import { IWarehouseRegistrationInput } from '@modules/server.common/routers/IWarehouseRouter';
import { getFakeImg } from '@modules/server.common/utils';
import { environment } from 'environments/environment';
import faker from 'faker';
import _ from 'lodash';
// import { _appIdRandomProviderFactory } from '@angular/core/src/application_tokens';

const NEED_DEFAULT_SETTINGS_MESSAGE =
	"Can't generate fake data without DEFAULT_LONGITUDE and DEFAULT_LATITUDE";
const lng = environment['DEFAULT_LONGITUDE'];
const lat = environment['DEFAULT_LATITUDE'];

@Injectable()
export default class FakeDataWarehouses {
	readonly registrationInputs: Readonly<{
		generate(): IWarehouseRegistrationInput;
		pizzaRestaurant: IWarehouseRegistrationInput;
		pizzaHit: IWarehouseRegistrationInput;
		pizzaTroya: IWarehouseRegistrationInput;
		dominexPizza: IWarehouseRegistrationInput;
	}> =
		lng && lat
			? {
					generate: () => {
						const warehouseName = faker.company.companyName();

						return {
							warehouse: {
								name: `Restaurant ${warehouseName}`,
								isActive: true,
								username: faker.internet.userName(),
								logo: getFakeImg(200, 200, 75, warehouseName),
								contactEmail: faker.internet.email(),
								contactPhone: faker.phone.phoneNumber(),
								ordersEmail: null,
								ordersPhone: null,
								forwardOrdersUsing: [
									ForwardOrdersMethod.Unselected,
								],
								isManufacturing: true,
								isCarrierRequired: true,
								usedCarriersIds: [],
								geoLocation: {
									city: faker.address.city(),
									postcode: faker.address.zipCode(),
									streetAddress: faker.address.streetAddress(),
									house: faker.random.number(199).toString(),
									countryId: faker.random.number(
										1
									) as Country,
									loc: {
										type: 'Point',
										coordinates: [lng, lat],
									},
								},
								_createdAt: this._getRandomDateRange(),
							},
							password: '123456',
						};
					},

					pizzaRestaurant: {
						warehouse: {
							name: 'Pizza Dan',
							isActive: true,
							username: 'restaurant_pizza',
							logo: getFakeImg(200, 200, 75, 'Pizza Dan'),
							contactEmail: faker.internet.email(),
							contactPhone: faker.phone.phoneNumber(),
							forwardOrdersUsing: [
								ForwardOrdersMethod.Unselected,
							],
							ordersEmail: null,
							ordersPhone: null,
							isManufacturing: true,
							isCarrierRequired: true,
							hasRestrictedCarriers: false,
							usedCarriersIds: [],
							products: [],
							geoLocation: {
								city: 'Ashdod',
								postcode: '77452',
								streetAddress: 'HaAtsmaut',
								house: '125',
								countryId: Country.IL,
								loc: {
									type: 'Point',
									coordinates: [lng + 0.05, lat + 0.09],
								},
							},
							_createdAt: this._getRandomDateRange(),
						},
						password: '123456',
					} as any,

					pizzaHit: {
						warehouse: {
							name: 'Pizza Hit',
							isActive: true,
							username: 'hut_pizza',
							logo: getFakeImg(200, 200, 75, 'Pizza Hit'),
							contactEmail: faker.internet.email(),
							contactPhone: faker.phone.phoneNumber(),
							forwardOrdersUsing: [
								ForwardOrdersMethod.Unselected,
							],
							ordersEmail: null,
							ordersPhone: null,
							isManufacturing: true,
							isCarrierRequired: true,
							hasRestrictedCarriers: false,
							usedCarriersIds: [],
							products: [],
							geoLocation: {
								city: 'Ashdod',
								postcode: '77452',
								streetAddress: 'HaAtsmaut',
								house: '125',
								countryId: Country.IL,
								loc: {
									type: 'Point',
									coordinates: [lng - 0.05, lat - 0.09],
								},
							},
							_createdAt: this._getRandomDateRange(),
						},
						password: '123456',
					} as any,

					pizzaTroya: {
						warehouse: {
							name: 'Pizza Troya',
							isActive: true,
							username: 'trova_pizza',
							logo: getFakeImg(200, 200, 75, 'Pizza Troya'),
							contactEmail: faker.internet.email(),
							contactPhone: faker.phone.phoneNumber(),
							forwardOrdersUsing: [
								ForwardOrdersMethod.Unselected,
							],
							ordersEmail: null,
							ordersPhone: null,
							isManufacturing: false,
							isCarrierRequired: false,
							hasRestrictedCarriers: false,
							usedCarriersIds: [],
							products: [],
							geoLocation: {
								city: 'Ashdod',
								postcode: '77452',
								streetAddress: 'HaAtsmaut',
								house: '128',
								countryId: Country.IL,
								loc: {
									type: 'Point',
									coordinates: [lng + 0.08, lat + 0.07],
								},
							},
							_createdAt: this._getRandomDateRange(),
						} as any,
						password: '123456',
					},

					dominexPizza: {
						warehouse: {
							name: 'Dominex Pizza',
							isActive: true,
							username: 'dominex_pizza',
							logo: getFakeImg(200, 200, 75, 'Pizza Pizza'),
							contactEmail: faker.internet.email(),
							contactPhone: faker.phone.phoneNumber(),
							forwardOrdersUsing: [
								ForwardOrdersMethod.Unselected,
							],
							ordersEmail: null,
							ordersPhone: null,
							isManufacturing: true,
							isCarrierRequired: true,
							hasRestrictedCarriers: false,
							usedCarriersIds: [],
							products: [],
							geoLocation: {
								city: 'Ashdod',
								postcode: '77452',
								streetAddress: 'HaAtsmaut',
								house: '125',
								countryId: Country.IL,
								loc: {
									type: 'Point',
									coordinates: [lng - 0.08, lat - 0.07],
								},
							},
							_createdAt: this._getRandomDateRange(),
						} as any,
						password: '123456',
					},
			  }
			: null;

	getHardcodedGeoLocation(): IGeoLocationCreateObject {
		if (lng && lat) {
			return {
				city: 'Ashdod',
				postcode: '77452',
				streetAddress: 'HaAtsmaut',
				house: '38',
				countryId: Country.IL,
				loc: {
					type: 'Point',
					coordinates: [lng, lat],
				},
			};
		} else {
			console.warn(NEED_DEFAULT_SETTINGS_MESSAGE);
			return;
		}
	}

	getNewGeoLocation1(): IGeoLocationCreateObject {
		if (lng && lat) {
			return {
				city: faker.address.city(),
				postcode: faker.address.zipCode(),
				streetAddress: faker.address.streetAddress(),
				house: faker.random.number(199).toString(),
				countryId: faker.random.number(1) as Country,
				loc: {
					type: 'Point',
					coordinates: [lng + 0.05, lat - 0.08],
				},
			};
		} else {
			console.warn(NEED_DEFAULT_SETTINGS_MESSAGE);
			return;
		}
	}

	private _getRandomDateRange(yearsRange: number = 6) {
		const now = new Date();
		const currentYear = now.getFullYear();
		const startYear = currentYear - yearsRange;

		const storeYear = _.random(startYear, currentYear);
		const storeMonth = _.random(11);
		const storeDate = _.random(31);
		const storeHours = _.random(23);
		const storeMinutes = _.random(59);

		const storeCreatedAt = new Date(
			storeYear,
			storeMonth,
			storeDate,
			storeHours,
			storeMinutes
		);

		if (storeCreatedAt > now) {
			const diff = storeCreatedAt.getTime() - now.getTime();
			storeCreatedAt.setTime(now.getTime() - _.random(diff));
		}

		return storeCreatedAt;
	}
}
