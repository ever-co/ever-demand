import { TestBed } from '@angular/core/testing';
import {
	ApolloTestingController,
	ApolloTestingModule,
} from 'apollo-angular/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Store } from './store.service';
import { WarehouseOrdersService } from './warehouse-orders.service';

describe('Store (merchant)', () => {
	let translate: { use: ReturnType<typeof vi.fn> };
	let warehouseRouter: { get: ReturnType<typeof vi.fn> };
	let store: Store;

	beforeEach(() => {
		localStorage.clear();
		translate = { use: vi.fn() };
		warehouseRouter = { get: vi.fn() };
		store = new Store(translate as any, warehouseRouter as any);
	});

	afterEach(() => localStorage.clear());

	it('keeps the session in localStorage', () => {
		store.token = 'jwt';
		store.warehouseId = 'w1';
		store.deviceId = 'd1';

		expect(localStorage.getItem('token')).toBe('jwt');
		expect(localStorage.getItem('_warehouseId')).toBe('w1');
		expect(store.deviceId).toBe('d1');

		store.token = null;
		store.warehouseId = null;
		expect(store.token).toBeNull();
		expect(store.warehouseId).toBeNull();
	});

	it('switches the UI language', () => {
		store.language = 'bg-BG';
		expect(store.language).toBe('bg-BG');
		expect(translate.use).toHaveBeenCalledWith('bg-BG');
	});

	it('is logged in only when the stored store exists', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		expect(await store.isLogged()).toBe(false);

		store.warehouseId = 'w1';
		warehouseRouter.get.mockReturnValue(of({ id: 'w1' }));
		expect(await store.isLogged()).toBe(true);
		expect(warehouseRouter.get).toHaveBeenCalledWith('w1', false);

		warehouseRouter.get.mockReturnValue(throwError(() => new Error('gone')));
		expect(await store.isLogged()).toBe(false);
	});
});

describe('GraphQL services (merchant)', () => {
	let controller: ApolloTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ApolloTestingModule],
			providers: [AuthService, WarehouseOrdersService],
		});
		controller = TestBed.inject(ApolloTestingController);
	});

	afterEach(() => controller.verify());

	it('AuthService.login runs warehouseLogin', async () => {
		const result = firstValueFrom(
			TestBed.inject(AuthService).login('hut_pizza', '123456')
		);
		const op = controller.expectOne('WarehouseLogin');
		expect(op.operation.variables).toEqual({
			username: 'hut_pizza',
			password: '123456',
		});
		op.flush({
			data: {
				warehouseLogin: {
					token: 'jwt',
					warehouse: { id: 'w1', __typename: 'Warehouse' },
					__typename: 'WarehouseLoginInfo',
				},
			},
		});

		const info = await result;
		expect(info.token).toBe('jwt');
		expect(info.warehouse.id).toBe('w1');
	});

	it('WarehouseOrdersService.createOrder sends the order and returns it', async () => {
		const createInput = {
			warehouseId: 'w1',
			userId: 'u1',
			products: [{ count: 2, productId: 'p1' }],
		} as any;
		const result = firstValueFrom(
			TestBed.inject(WarehouseOrdersService).createOrder(createInput)
		);
		const op = controller.expectOne('MakeOrder');
		expect(op.operation.variables).toEqual({ createInput });
		op.flush({
			data: {
				createOrder: {
					_id: 'o1',
					_createdAt: '2026-11-25',
					_updatedAt: '2026-11-25',
					carrierStatus: 0,
					isConfirmed: false,
					warehouseId: 'w1',
					warehouseStatus: 0,
					user: { _id: 'u1', __typename: 'User' },
					carrier: null,
					__typename: 'Order',
				},
			},
		});

		expect((await result)._id).toBe('o1');
	});

	it('WarehouseOrdersService.getCountOfStoreOrders filters by status', async () => {
		const result = TestBed.inject(
			WarehouseOrdersService
		).getCountOfStoreOrders('w1', 'confirmed');
		const op = controller.expectOne('getCountOfStoreOrders');
		expect(op.operation.variables).toEqual({ storeId: 'w1', status: 'confirmed' });
		op.flush({ data: { getCountOfStoreOrders: 7 } });

		expect(await result).toBe(7);
	});
});
