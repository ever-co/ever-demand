import { TestBed } from '@angular/core/testing';
import {
	ApolloTestingController,
	ApolloTestingModule,
} from 'apollo-angular/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { CarriersOrdersService } from './carriers-orders.service';
import { GeoLocationOrdersService } from './geo-location-order.service';

describe('GraphQL services', () => {
	let controller: ApolloTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ApolloTestingModule],
			providers: [AuthService, CarriersOrdersService, GeoLocationOrdersService],
		});
		controller = TestBed.inject(ApolloTestingController);
	});

	afterEach(() => controller.verify());

	it('AuthService.login runs the carrierLogin mutation and returns its payload', async () => {
		const result = firstValueFrom(
			TestBed.inject(AuthService).login('ever', 'changeme')
		);

		const op = controller.expectOne('CarrierLogin');
		expect(op.operation.variables).toEqual({
			username: 'ever',
			password: 'changeme',
		});
		op.flush({
			data: {
				carrierLogin: {
					token: 'jwt',
					carrier: { id: 'c1', __typename: 'Carrier' },
					__typename: 'CarrierLoginInfo',
				},
			},
		});

		const info = await result;
		expect(info.token).toBe('jwt');
		expect(info.carrier.id).toBe('c1');
	});

	it('AuthService.login resolves null when the credentials are wrong', async () => {
		const result = firstValueFrom(
			TestBed.inject(AuthService).login('ever', 'bad')
		);
		controller
			.expectOne('CarrierLogin')
			.flush({ data: { carrierLogin: null } });

		expect(await result).toBeNull();
	});

	it('CarriersOrdersService.getCarrierOrders asks for all orders of the carrier', async () => {
		const result = TestBed.inject(CarriersOrdersService).getCarrierOrders(
			'c1',
			{ populateWarehouse: true, completion: 'all' }
		);

		const op = controller.expectOne('GetCarrierOrders');
		expect(op.operation.variables).toEqual({
			carrierId: 'c1',
			options: { populateWarehouse: true, completion: 'all' },
		});
		op.flush({ data: { getCarrierOrders: [] } });

		expect(await result).toEqual([]);
	});

	it('GeoLocationOrdersService.getOrderForWork emits the next order to work on', async () => {
		const geoLocation = {
			loc: { type: 'Point', coordinates: [23.33, 42.64] },
		} as any;
		const result = firstValueFrom(
			TestBed.inject(GeoLocationOrdersService).getOrderForWork(
				geoLocation,
				['skipped'],
				{ sort: 'asc' },
				{ isCancelled: false }
			)
		);

		const op = controller.expectOne('GetOrderForWork');
		expect(op.operation.variables).toMatchObject({
			skippedOrderIds: ['skipped'],
			options: { sort: 'asc' },
			searchObj: { isCancelled: false },
		});
		op.flush({
			data: { getOrderForWork: { id: 'o1', __typename: 'Order' } },
		});

		expect((await result).id).toBe('o1');
	});
});
