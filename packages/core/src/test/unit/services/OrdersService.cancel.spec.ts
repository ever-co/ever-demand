import 'reflect-metadata';
import OrderCarrierStatus from '@modules/server.common/enums/OrderCarrierStatus';
import OrderWarehouseStatus from '@modules/server.common/enums/OrderWarehouseStatus';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only `cancel()` and the two status updates are exercised.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
}));
jest.mock('@pyro/db-server', () => ({
	DBService: class {},
	ExistenceEventType: { Updated: 'updated' },
}));
jest.mock('../../../env', () => ({
	env: { STRIPE_SECRET_KEY: 'test-stripe-key' },
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/warehouses', () => ({
	WarehousesService: class {},
	WarehousesProductsService: class {},
}));
jest.mock('../../../services/users', () => ({ UsersService: class {} }));
jest.mock('../../../services/carriers/CarriersService', () => ({
	__esModule: true,
	default: class {},
}));
jest.mock('../../../services/products', () => ({ ProductsService: class {} }));
jest.mock('stripe', () => ({
	Stripe: jest.fn().mockImplementation(() => ({})),
}));

import { OrdersService } from '../../../services/orders/OrdersService';

const ORDER_ID = '5f1a2b3c4d5e6f7a8b9c0d1e';

/**
 * Stand-in for the orders collection holding one order. Its findOneAndUpdate
 * applies the filter the way MongoDB does for the operators used here (plain
 * equality and $ne): a write whose filter does not match changes nothing and
 * resolves to null.
 */
function fakeOrdersModel(stored: Record<string, any>) {
	const matches = (filter: Record<string, any>) =>
		Object.keys(filter).every((key) => {
			const condition = filter[key];

			return condition != null &&
				typeof condition === 'object' &&
				'$ne' in condition
				? stored[key] !== condition.$ne
				: String(stored[key]) === String(condition);
		});

	return {
		findOneAndUpdate: jest.fn((filter: any, updateObj: any) => ({
			lean: () => ({
				exec: async () => {
					if (!matches(filter)) {
						return null;
					}

					Object.assign(stored, updateObj);

					return { ...stored };
				},
			}),
		})),
	};
}

describe('OrdersService writes on cancelled orders', () => {
	let stored: Record<string, any>;
	let model: ReturnType<typeof fakeOrdersModel>;
	let update: jest.Mock;
	let get: jest.Mock;
	let existenceNext: jest.Mock;
	let carriersService: { increaseNumberOfDeliveries: jest.Mock };
	let service: OrdersService;

	// What a read returns: a copy of the stored order at the time of the read
	const read = () => ({ id: ORDER_ID, ...stored });

	beforeEach(() => {
		stored = {
			_id: ORDER_ID,
			warehouse: 'w1',
			carrier: 'c1',
			isCancelled: false,
			isPaid: false,
			carrierStatus: OrderCarrierStatus.CarrierStartDelivery,
			warehouseStatus: OrderWarehouseStatus.GivenToCarrier,
			finishedProcessingTime: 111,
		};

		model = fakeOrdersModel(stored);
		carriersService = { increaseNumberOfDeliveries: jest.fn() };

		service = new OrdersService(
			{} as any,
			{} as any,
			carriersService as any,
			{} as any,
			{} as any,
			{} as any
		);

		// The unconditional write: none of these paths may use it
		update = jest.fn(async (_id, updateObj) => ({
			...stored,
			...updateObj,
			carrierId: stored.carrier,
		}));
		get = jest.fn(async () => read());
		existenceNext = jest.fn();

		(service as any)._throwIfNotExists = jest.fn(async () => undefined);
		(service as any)._get = get;
		(service as any).getCurrent = jest.fn(async () => read());
		(service as any).update = update;
		(service as any).Model = model;
		(service as any).existence = { next: existenceNext };
	});

	describe('cancel', () => {
		it('refuses to cancel a delivered order and does not write it', async () => {
			stored.carrierStatus = OrderCarrierStatus.DeliveryCompleted;

			await expect(service.cancel(ORDER_ID)).rejects.toThrow(
				/can not be cancelled/
			);

			expect(update).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).not.toHaveBeenCalled();
		});

		it('refuses to cancel an order given to the customer and does not write it', async () => {
			stored.warehouseStatus = OrderWarehouseStatus.GivenToCustomer;

			await expect(service.cancel(ORDER_ID)).rejects.toThrow(
				/can not be cancelled/
			);

			expect(update).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).not.toHaveBeenCalled();
		});

		it('cancels an order that is still on its way with one conditional write', async () => {
			const cancelled = await service.cancel(ORDER_ID);

			expect(cancelled.isCancelled).toBe(true);
			expect(stored.isCancelled).toBe(true);
			expect(update).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).toHaveBeenCalledTimes(1);
			expect(model.findOneAndUpdate).toHaveBeenCalledWith(
				{
					_id: ORDER_ID,
					isCancelled: { $ne: true },
					carrierStatus: {
						$ne: OrderCarrierStatus.DeliveryCompleted,
					},
					warehouseStatus: {
						$ne: OrderWarehouseStatus.GivenToCustomer,
					},
				},
				expect.objectContaining({ isCancelled: true }),
				{ new: true }
			);
			expect(existenceNext).toHaveBeenCalledWith(
				expect.objectContaining({ id: ORDER_ID, type: 'updated' })
			);
		});

		it('resolves to null and writes nothing when another cancel got there first', async () => {
			// Both cancels read the order before either one wrote it
			get.mockResolvedValueOnce(read());
			stored.isCancelled = true;

			const result = await service.cancel(ORDER_ID);

			expect(result).toBeNull();
			expect(update).not.toHaveBeenCalled();
			expect(stored.finishedProcessingTime).toBe(111);
			expect(existenceNext).not.toHaveBeenCalled();
		});

		it('refuses when the order was delivered after the check, and writes nothing', async () => {
			// The carrier taps Delivered between the check and the write
			get.mockResolvedValueOnce(read());
			stored.carrierStatus = OrderCarrierStatus.DeliveryCompleted;

			await expect(service.cancel(ORDER_ID)).rejects.toThrow(
				/can not be cancelled/
			);

			expect(update).not.toHaveBeenCalled();
			expect(stored.isCancelled).toBe(false);
			expect(existenceNext).not.toHaveBeenCalled();
		});
	});

	describe('updateCarrierStatus', () => {
		it('refuses to deliver a cancelled order and does not write it', async () => {
			stored.isCancelled = true;

			await expect(
				service.updateCarrierStatus(
					ORDER_ID,
					OrderCarrierStatus.DeliveryCompleted
				)
			).rejects.toThrow(/is cancelled/);

			expect(update).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
			expect(stored.carrierStatus).toBe(
				OrderCarrierStatus.CarrierStartDelivery
			);
			expect(
				carriersService.increaseNumberOfDeliveries
			).not.toHaveBeenCalled();
		});

		it('refuses when the order is cancelled between the read and the write', async () => {
			get.mockResolvedValueOnce(read());
			stored.isCancelled = true;

			await expect(
				service.updateCarrierStatus(
					ORDER_ID,
					OrderCarrierStatus.DeliveryCompleted
				)
			).rejects.toThrow(/is cancelled/);

			expect(update).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
			expect(stored.carrierStatus).toBe(
				OrderCarrierStatus.CarrierStartDelivery
			);
			expect(
				carriersService.increaseNumberOfDeliveries
			).not.toHaveBeenCalled();
		});

		it('delivers an open order with a write that skips cancelled orders', async () => {
			const order = await service.updateCarrierStatus(
				ORDER_ID,
				OrderCarrierStatus.DeliveryCompleted
			);

			expect(order.carrierStatus).toBe(
				OrderCarrierStatus.DeliveryCompleted
			);
			expect(order.isPaid).toBe(true);
			expect(update).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: ORDER_ID, isCancelled: { $ne: true } },
				expect.objectContaining({
					carrierStatus: OrderCarrierStatus.DeliveryCompleted,
					isPaid: true,
				}),
				{ new: true }
			);
			expect(
				carriersService.increaseNumberOfDeliveries
			).toHaveBeenCalledWith('c1', 1);
		});
	});

	describe('confirm', () => {
		it('refuses to confirm a cancelled order and does not write it', async () => {
			stored.isCancelled = true;

			await expect(service.confirm(ORDER_ID)).rejects.toThrow(
				/is cancelled/
			);

			expect(update).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).not.toHaveBeenCalled();
			expect(stored.isConfirmed).toBeUndefined();
			expect(stored.warehouseStatus).toBe(
				OrderWarehouseStatus.GivenToCarrier
			);
		});

		it('refuses when the order is cancelled between the read and the write', async () => {
			get.mockResolvedValueOnce(read());
			stored.isCancelled = true;

			await expect(service.confirm(ORDER_ID)).rejects.toThrow(
				/is cancelled/
			);

			expect(update).not.toHaveBeenCalled();
			expect(stored.isConfirmed).toBeUndefined();
		});

		it('confirms an open order with a write that skips cancelled orders', async () => {
			const order = await service.confirm(ORDER_ID);

			expect(order.isConfirmed).toBe(true);
			expect(order.warehouseStatus).toBe(
				OrderWarehouseStatus.ReadyForProcessing
			);
			expect(update).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: ORDER_ID, isCancelled: { $ne: true } },
				{
					isConfirmed: true,
					warehouseStatus: OrderWarehouseStatus.ReadyForProcessing,
				},
				{ new: true }
			);
		});
	});

	describe('paid', () => {
		it('refuses to mark a cancelled order as paid and does not write it', async () => {
			stored.isCancelled = true;

			await expect(service.paid(ORDER_ID)).rejects.toThrow(
				/is cancelled/
			);

			expect(update).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
		});

		it('refuses when the order is cancelled between the read and the write', async () => {
			get.mockResolvedValueOnce(read());
			stored.isCancelled = true;

			await expect(service.paid(ORDER_ID)).rejects.toThrow(
				/is cancelled/
			);

			expect(update).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
		});

		it('marks an open order as paid with a write that skips cancelled orders', async () => {
			const order = await service.paid(ORDER_ID);

			expect(order.isPaid).toBe(true);
			expect(stored.isPaid).toBe(true);
			expect(update).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: ORDER_ID, isCancelled: { $ne: true } },
				{ isPaid: true },
				{ new: true }
			);
		});
	});

	describe('updateWarehouseStatus', () => {
		beforeEach(() => {
			stored.carrier = undefined;
			stored.carrierStatus = OrderCarrierStatus.NoCarrier;
			stored.warehouseStatus = OrderWarehouseStatus.PackagingFinished;
		});

		it('refuses to give a cancelled order to the customer and does not write it', async () => {
			stored.isCancelled = true;

			await expect(
				service.updateWarehouseStatus(
					ORDER_ID,
					OrderWarehouseStatus.GivenToCustomer
				)
			).rejects.toThrow(/is cancelled/);

			expect(update).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
			expect(stored.warehouseStatus).toBe(
				OrderWarehouseStatus.PackagingFinished
			);
		});

		it('refuses when the order is cancelled between the read and the write', async () => {
			get.mockResolvedValueOnce(read());
			stored.isCancelled = true;

			await expect(
				service.updateWarehouseStatus(
					ORDER_ID,
					OrderWarehouseStatus.GivenToCustomer
				)
			).rejects.toThrow(/is cancelled/);

			expect(update).not.toHaveBeenCalled();
			expect(stored.isPaid).toBe(false);
			expect(stored.warehouseStatus).toBe(
				OrderWarehouseStatus.PackagingFinished
			);
		});

		it('gives an open order to the customer with a write that skips cancelled orders', async () => {
			const order = await service.updateWarehouseStatus(
				ORDER_ID,
				OrderWarehouseStatus.GivenToCustomer
			);

			expect(order.warehouseStatus).toBe(
				OrderWarehouseStatus.GivenToCustomer
			);
			expect(order.isPaid).toBe(true);
			expect(update).not.toHaveBeenCalled();
			expect(model.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: ORDER_ID, isCancelled: { $ne: true } },
				expect.objectContaining({
					warehouseStatus: OrderWarehouseStatus.GivenToCustomer,
					isPaid: true,
				}),
				{ new: true }
			);
		});
	});
});
