import 'reflect-metadata';
import sift from 'sift';
import { of } from 'rxjs';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test, as CarriersOrdersService.updateStatus.spec.ts does. Orders
// and stores live in memory, and the filters the service hands to
// `ordersService` and `warehousesService` are applied to them with sift, the
// way MongoDB would apply them.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({
	DBService: class {},
	ExistenceEventType: { Created: 0, Updated: 1, Removed: 2 },
}));
jest.mock('../../../env', () => ({
	env: { STRIPE_SECRET_KEY: 'test-stripe-key' },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('stripe', () => ({ Stripe: jest.fn() }));
jest.mock('../../../services/warehouses', () => ({
	WarehousesService: class {},
	WarehousesProductsService: class {},
	WarehousesOrdersService: class {},
}));
jest.mock('../../../services/geo-locations', () => ({
	GeoLocationsOrdersService: class {},
}));
jest.mock('../../../services/users', () => ({ UsersService: class {} }));
jest.mock('../../../services/carriers/CarriersService', () => ({
	__esModule: true,
	default: class {},
}));
jest.mock('../../../services/products', () => ({ ProductsService: class {} }));

import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import { CarriersOrdersService } from '../../../services/carriers/CarriersOrdersService';

interface SampleOrder {
	_id: string;
	id: string;
	warehouse: string;
	warehouseId: string;
	carrier?: string;
	carrierStatus: OrderCarrierStatus;
	isCancelled: boolean;
	isDeleted: boolean;
}

interface SampleStore {
	_id: string;
	id: string;
	carrierCompetition: boolean;
}

const carrierId = 'carrier-1';
const otherCarrierId = 'carrier-2';
const plainStoreId = 'plain-store';
const competitionStoreId = 'competition-store';

const stores: SampleStore[] = [
	{ _id: plainStoreId, id: plainStoreId, carrierCompetition: false },
	{
		_id: competitionStoreId,
		id: competitionStoreId,
		carrierCompetition: true,
	},
];

function sampleOrder(
	id: string,
	overrides: Partial<Omit<SampleOrder, '_id' | 'id' | 'warehouseId'>> = {}
): SampleOrder {
	const order = {
		warehouse: plainStoreId,
		carrierStatus: OrderCarrierStatus.NoCarrier,
		isCancelled: false,
		isDeleted: false,
		...overrides,
	};

	return { ...order, _id: id, id, warehouseId: order.warehouse };
}

describe('CarriersOrdersService.selectedForDelivery and cancelDelivery', () => {
	const carrier = { id: carrierId };

	let orders: SampleOrder[];
	let service: CarriersOrdersService;
	let find: jest.Mock;
	let updateMultiple: jest.Mock;
	let updateMultipleByIds: jest.Mock;

	beforeEach(() => {
		orders = [];

		const matching = <T>(items: T[], conditions: any) => {
			const test = sift(conditions);
			return items.filter((item) => test(item));
		};

		find = jest.fn(async (conditions: any) => matching(orders, conditions));
		updateMultiple = jest.fn(async (findObj: any) =>
			matching(orders, findObj)
		);
		updateMultipleByIds = jest.fn(async (ids: string[]) =>
			orders.filter((order) => ids.includes(order.id))
		);

		const carriersService = {
			get: jest.fn(() => of(carrier)),
			throwIfNotExists: jest.fn(async () => undefined),
			update: jest.fn(async () => carrier),
			updateStatus: jest.fn(async () => carrier),
		};

		const warehousesService = {
			find: jest.fn(async (conditions: any) =>
				matching(stores, conditions)
			),
		};

		service = new CarriersOrdersService(
			carriersService as any,
			{} as any,
			{ find, updateMultiple, updateMultipleByIds } as any,
			{} as any,
			{} as any,
			warehousesService as any
		);
	});

	describe('selectedForDelivery', () => {
		async function select(
			order: SampleOrder,
			carrierCompetition?: boolean
		) {
			orders = [order];

			return service.selectedForDelivery(
				carrierId,
				[order.id],
				carrierCompetition
			);
		}

		function lastSelectCall() {
			expect(updateMultiple).toHaveBeenCalledTimes(1);

			const [findObj, updateObj] = updateMultiple.mock.calls[0];

			return {
				updateObj,
				matches: (order: SampleOrder) => sift(findObj)(order),
			};
		}

		it('assigns an order no carrier has taken yet', async () => {
			const order = sampleOrder('free');

			await select(order);

			const { matches, updateObj } = lastSelectCall();
			expect(matches(order)).toBe(true);
			expect(updateObj).toEqual({
				carrier: carrierId,
				carrierStatus: OrderCarrierStatus.CarrierSelectedOrder,
			});
		});

		it('accepts an order the same carrier already selected', async () => {
			const order = sampleOrder('mine', {
				carrier: carrierId,
				carrierStatus: OrderCarrierStatus.CarrierSelectedOrder,
			});

			await select(order);

			expect(lastSelectCall().matches(order)).toBe(true);
		});

		it.each([
			['a cancelled order', { isCancelled: true }],
			['a deleted order', { isDeleted: true }],
			[
				'a delivered order',
				{
					carrier: carrierId,
					carrierStatus: OrderCarrierStatus.DeliveryCompleted,
				},
			],
			[
				'an order already picked up',
				{
					carrier: otherCarrierId,
					carrierStatus: OrderCarrierStatus.CarrierPickedUpOrder,
				},
			],
			[
				"another carrier's selected order in a store without competition",
				{
					carrier: otherCarrierId,
					carrierStatus: OrderCarrierStatus.CarrierSelectedOrder,
				},
			],
		])(
			'rejects %s and changes nothing',
			async (_label, overrides: Partial<SampleOrder>) => {
				const order = sampleOrder('taken', overrides);

				await expect(select(order)).rejects.toThrow(
					'Orders are no longer available'
				);

				expect(lastSelectCall().matches(order)).toBe(false);
				expect(updateMultipleByIds).not.toHaveBeenCalled();
			}
		);

		it("lets a carrier take another carrier's selected order in a competition store", async () => {
			const order = sampleOrder('contested', {
				warehouse: competitionStoreId,
				carrier: otherCarrierId,
				carrierStatus: OrderCarrierStatus.CarrierSelectedOrder,
			});

			await select(order, true);

			const { matches, updateObj } = lastSelectCall();
			expect(matches(order)).toBe(true);
			expect(updateObj).toEqual({
				carrier: carrierId,
				carrierStatus: OrderCarrierStatus.CarrierPickedUpOrder,
			});
		});

		it("does not let a late carrier overwrite the competition winner's pick-up", async () => {
			const order = sampleOrder('won', {
				warehouse: competitionStoreId,
				carrier: otherCarrierId,
				carrierStatus: OrderCarrierStatus.CarrierPickedUpOrder,
			});

			await expect(select(order, true)).rejects.toThrow(
				'Orders are no longer available'
			);

			expect(lastSelectCall().matches(order)).toBe(false);
		});

		it('updates only the orders still available when some are not', async () => {
			const free = sampleOrder('free');
			const delivered = sampleOrder('delivered', {
				carrier: carrierId,
				carrierStatus: OrderCarrierStatus.DeliveryCompleted,
			});
			orders = [free, delivered];

			await service.selectedForDelivery(carrierId, [
				free.id,
				delivered.id,
			]);

			const { matches } = lastSelectCall();
			expect(matches(free)).toBe(true);
			expect(matches(delivered)).toBe(false);
		});
	});

	describe('cancelDelivery', () => {
		async function cancel(order: SampleOrder) {
			orders = [order];

			await service.cancelDelivery(carrierId, [order.id]);

			expect(updateMultipleByIds).toHaveBeenCalledTimes(1);

			return updateMultipleByIds.mock.calls[0][0] as string[];
		}

		it.each([
			['selected', OrderCarrierStatus.CarrierSelectedOrder],
			['picked up', OrderCarrierStatus.CarrierPickedUpOrder],
			['in delivery', OrderCarrierStatus.CarrierStartDelivery],
		])(
			'unassigns an order of the carrier that is %s',
			async (_label, carrierStatus: OrderCarrierStatus) => {
				const order = sampleOrder('mine', {
					carrier: carrierId,
					carrierStatus,
				});

				expect(await cancel(order)).toEqual([order.id]);
			}
		);

		it("leaves another carrier's order alone", async () => {
			const order = sampleOrder('theirs', {
				carrier: otherCarrierId,
				carrierStatus: OrderCarrierStatus.CarrierSelectedOrder,
			});

			expect(await cancel(order)).toEqual([]);
		});

		it('leaves a delivered order alone', async () => {
			const order = sampleOrder('delivered', {
				carrier: carrierId,
				carrierStatus: OrderCarrierStatus.DeliveryCompleted,
			});

			expect(await cancel(order)).toEqual([]);
		});
	});
});
