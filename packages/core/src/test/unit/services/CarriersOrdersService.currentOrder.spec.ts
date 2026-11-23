import 'reflect-metadata';
import sift from 'sift';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test, as CarriersOrdersService.updateStatus.spec.ts does. Orders
// live in memory, and the filter `getCarrierCurrentOrder()` hands to
// `ordersService.Model.findOne()` is applied to them with sift, the way
// MongoDB would apply it.
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
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';
import { CarriersOrdersService } from '../../../services/carriers/CarriersOrdersService';

interface SampleOrder {
	_id: string;
	carrier?: string;
	carrierStatus: OrderCarrierStatus;
	warehouseStatus: OrderWarehouseStatus;
	isCancelled: boolean;
	isDeleted: boolean;
}

const carrierId = 'carrier-1';

function carrierOrder(
	id: string,
	overrides: Partial<Omit<SampleOrder, '_id'>> = {}
): SampleOrder {
	return {
		_id: id,
		carrier: carrierId,
		carrierStatus: OrderCarrierStatus.CarrierSelectedOrder,
		warehouseStatus: OrderWarehouseStatus.PackagingFinished,
		isCancelled: false,
		isDeleted: false,
		...overrides,
	};
}

describe('CarriersOrdersService.getCarrierCurrentOrder', () => {
	let orders: SampleOrder[];
	let service: CarriersOrdersService;
	let throwIfNotExists: jest.Mock;
	let findOne: jest.Mock;

	beforeEach(() => {
		orders = [];
		throwIfNotExists = jest.fn(async () => undefined);

		// `findOne(filter).lean().exec()` gives the first order the filter
		// matches, or null, as MongoDB does.
		findOne = jest.fn((findObj) => {
			const query = {
				lean: () => query,
				exec: async () =>
					orders.find((order) => sift(findObj)(order)) || null,
			};

			return query;
		});

		service = new CarriersOrdersService(
			{ throwIfNotExists } as any,
			{} as any,
			{ Model: { findOne } } as any,
			{} as any,
			{} as any,
			{} as any
		);
	});

	function filterUsed() {
		expect(findOne).toHaveBeenCalledTimes(1);

		return findOne.mock.calls[0][0];
	}

	it('returns the order the carrier is working on', async () => {
		orders = [carrierOrder('order-1')];

		const currentOrder = await service.getCarrierCurrentOrder(carrierId);

		expect(throwIfNotExists).toHaveBeenCalledWith(carrierId);
		expect(currentOrder).toMatchObject({ _id: 'order-1' });
	});

	it('does not look for an order of a carrier that does not exist', async () => {
		throwIfNotExists.mockRejectedValueOnce(new Error('no carrier'));

		await expect(service.getCarrierCurrentOrder(carrierId)).rejects.toThrow(
			'no carrier'
		);
		expect(findOne).not.toHaveBeenCalled();
	});

	it('only matches an order that is not cancelled and not deleted', async () => {
		await service.getCarrierCurrentOrder(carrierId);

		expect(filterUsed()).toMatchObject({
			carrier: carrierId,
			isCancelled: { $ne: true },
			isDeleted: { $eq: false },
		});
	});

	it.each([
		['selected', OrderCarrierStatus.CarrierSelectedOrder],
		['picked up', OrderCarrierStatus.CarrierPickedUpOrder],
		['in delivery', OrderCarrierStatus.CarrierStartDelivery],
		['at the customer', OrderCarrierStatus.CarrierArrivedToCustomer],
	])(
		'leaves out a cancelled order the carrier had %s',
		async (_label, carrierStatus: OrderCarrierStatus) => {
			orders = [
				carrierOrder('order-1', { carrierStatus, isCancelled: true }),
			];

			expect(await service.getCarrierCurrentOrder(carrierId)).toBeNull();
		}
	);

	it('leaves out a deleted order of the carrier', async () => {
		orders = [carrierOrder('order-1', { isDeleted: true })];

		expect(await service.getCarrierCurrentOrder(carrierId)).toBeNull();
	});

	it('returns the active order when a cancelled or deleted one comes first', async () => {
		orders = [
			carrierOrder('cancelled-order', { isCancelled: true }),
			carrierOrder('deleted-order', { isDeleted: true }),
			carrierOrder('active-order', {
				carrierStatus: OrderCarrierStatus.CarrierStartDelivery,
				warehouseStatus: OrderWarehouseStatus.GivenToCarrier,
			}),
		];

		const currentOrder = await service.getCarrierCurrentOrder(carrierId);

		expect(currentOrder).toMatchObject({ _id: 'active-order' });
	});

	it('still leaves out finished orders and orders of other carriers', async () => {
		orders = [
			carrierOrder('delivered-order', {
				carrierStatus: OrderCarrierStatus.DeliveryCompleted,
			}),
			carrierOrder('refused-order', {
				carrierStatus: OrderCarrierStatus.ClientRefuseTakingOrder,
			}),
			carrierOrder('issue-order', {
				carrierStatus: OrderCarrierStatus.IssuesDuringDelivery,
			}),
			carrierOrder('other-carrier-order', { carrier: 'carrier-2' }),
		];

		expect(await service.getCarrierCurrentOrder(carrierId)).toBeNull();
	});
});
