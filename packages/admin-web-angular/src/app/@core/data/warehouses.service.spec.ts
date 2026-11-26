import { TestBed } from '@angular/core/testing';
import { ApolloTestingController } from 'apollo-angular/testing';
import { firstValueFrom } from 'rxjs';
import Warehouse from '@modules/server.common/entities/Warehouse';
import {
	expectOperation,
	setupApolloTesting,
} from '../../../testing/apollo-testing';
import { WarehousesService } from './warehouses.service';

describe('WarehousesService (GraphQL)', () => {
	let service: WarehousesService;
	let controller: ApolloTestingController;

	beforeEach(() => {
		({ controller } = setupApolloTesting([WarehousesService]));
		service = TestBed.inject(WarehousesService);
	});

	afterEach(() => controller.verify());

	it('hasExistingStores() asks the API and unwraps the flag', async () => {
		const result = firstValueFrom(service.hasExistingStores());
		(await expectOperation(controller, 'HasExistingStores')).flush({
			data: { hasExistingStores: true },
		});
		await expect(result).resolves.toBe(true);
	});

	it('getStores() sends the paging options and maps to Warehouse entities', async () => {
		const result = firstValueFrom(
			service.getStores({ skip: 10, limit: 5 }),
		);
		const op = await expectOperation(controller, 'AllWarehouses');
		expect(op.operation.variables).toEqual({
			pagingOptions: { skip: 10, limit: 5 },
		});

		op.flush({
			data: {
				warehouses: [
					{
						_id: 'w1',
						_createdAt: '2026-11-01T00:00:00.000Z',
						name: 'Store 1',
						contactEmail: 'store@ever.co',
						contactPhone: '123',
						logo: 'http://logo/1.png',
						username: 'store1',
						usedCarriersIds: [],
						carriersIds: [],
						geoLocation: {
							city: 'Sofia',
							streetAddress: 'Vitosha',
							house: '1',
						},
					},
				],
			},
		});

		const stores = await result;
		expect(stores).toHaveLength(1);
		expect(stores[0]).toBeInstanceOf(Warehouse);
		expect(stores[0].name).toBe('Store 1');
		expect(stores[0].geoLocation.city).toBe('Sofia');
	});

	it('getCountExistingCustomers() unwraps total and perStore', async () => {
		const result = firstValueFrom(service.getCountExistingCustomers());
		(await expectOperation(controller, 'GetCountExistingCustomers')).flush({
			data: {
				getCountExistingCustomers: {
					total: 6,
					perStore: [{ storeId: 'w1', customersCount: 6 }],
				},
			},
		});
		await expect(result).resolves.toEqual({
			total: 6,
			perStore: [{ storeId: 'w1', customersCount: 6 }],
		});
	});

	it('removeByIds() sends the ids', async () => {
		const result = firstValueFrom(service.removeByIds(['w1', 'w2']));
		const op = await expectOperation(controller, 'RemoveByIds');
		expect(op.operation.variables).toEqual({ ids: ['w1', 'w2'] });
		op.flush({ data: { removeWarehousesByIds: null } });
		await expect(result).resolves.toBeTruthy();
	});
});
