/*
import 'jest';
import { servicesContainer } from '../../services/inversify.config';
import { GeoLocationsWarehousesService } from '../../services/geo-locations';
import faker from 'faker';
import ForwardOrdersMethod from '@modules/server.common/enums/ForwardOrdersMethod';
import {
	Country,
	default as GeoLocation
} from '@modules/server.common/entities/GeoLocation';
import { WarehousesService } from '../../services/warehouses';
import { ObjectID } from 'bson';
import { IWarehouseRegistrationInput } from '@modules/server.common/routers/IWarehouseRouter';
import mongoose from 'mongoose';
import { env } from '../../env';
import { randomCoordinatesNear } from '../../utils';
import { first, shareReplay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/Rx';
import { getPlaceholditImgix } from '@modules/server.common/utils';

jest.setTimeout(30000);
process.env.NODE_ENV = 'test';

function geoLocationFixture([lng, lat]: [number, number]): GeoLocation {
	return new GeoLocation({
		_id: new ObjectID().toHexString(),
		_createdAt: new Date(),
		_updatedAt: new Date(),
		city: faker.address.city(),
		postcode: faker.address.zipCode(),
		streetAddress: faker.address.streetAddress(),
		house: faker.random.number(199).toString(),
		countryId: faker.random.number(1) as Country,
		loc: {
			type: 'Point',
			coordinates: [lng, lat]
		}
	});
}

function warehouseFixture([lng, lat]: [
	number,
	number
]): IWarehouseRegistrationInput {
	const warehouseName = faker.company.companyName();

	return {
		password: faker.internet.password(),
		warehouse: {
			name: `Restaurant ${warehouseName}`,
			isActive: true,
			username: faker.internet.userName(),
			logo: getPlaceholditImgix(500, 500, 80, warehouseName),
			contactEmail: faker.internet.email(),
			contactPhone: faker.phone.phoneNumber(),
			ordersEmail: null,
			ordersPhone: null,
			forwardOrdersUsing: [ForwardOrdersMethod.Unselected],
			isManufacturing: true,
			isCarrierRequired: true,
			usedCarriersIds: [],
			geoLocation: geoLocationFixture([lng, lat])
		}
	};
}

describe('GeoLocationWarehouses', () => {
	beforeAll(async () => {
		const mongoUrl = env.TESTING_DB_URI;

		(mongoose as any).Promise = Promise;

		const options = {
			auto_reconnect: true,
			reconnectTries: Number.MAX_VALUE,
			reconnectInterval: 1000
		};

		await mongoose.connect(mongoUrl, options);
		console.log(`MongoDB successfully connected to ${mongoUrl}`);
	});

	beforeEach(async () => {
		servicesContainer.snapshot();
	});

	afterEach(async () => {
		for (const collection of Object.values(
			mongoose.connection.collections
		)) {
			await collection.drop();
		}
		servicesContainer.restore();
	});

	afterAll(async () => {
		await mongoose.disconnect();
	});

	describe('.get(conditions)', () => {
		const geoLocationsWarehousesService = servicesContainer.get<
			GeoLocationsWarehousesService
		>(GeoLocationsWarehousesService);
		const warehousesService = servicesContainer.get<WarehousesService>(
			WarehousesService
		);

		it('Finds nearby warehouses and tracks their changes', async () => {
			const coordinates: [number, number] = [10, 10]; // lng, lat
			const geoLocation = geoLocationFixture(coordinates);

			const testScheduler = new TestScheduler((actual, expected) => {
				expect(actual).toEqual(expected);
			});

			// This test will actually run *synchronously*
			/*testScheduler.run(({ cold, expectObservable }) => {
				const next = {
					handle: () => cold('-a-b-c--------|')
				};
				const output = interceptor.intercept(null, next);

				const expected = '   ----------c---|'; // or whatever your interceptor does
				expectObservable(output).toBe(expected);
			});

			const createNearbyWarehouse = async () => {
				await warehousesService.register(
					warehouseFixture(
						randomCoordinatesNear(coordinates, GeoLocationsWarehousesService.TrackingDistance)
					)
				);
			};

			await createNearbyWarehouse();

			const warehouses$ = geoLocationsWarehousesService.get(geoLocation).pipe(shareReplay());

			const warehouses = await warehouses$.pipe(first()).toPromise();

			expect(warehouses).toHaveLength(1);

			await createNearbyWarehouse();

			expect(warehouses).toHaveLength(1);*/

/*

		});
	});
});
*/
