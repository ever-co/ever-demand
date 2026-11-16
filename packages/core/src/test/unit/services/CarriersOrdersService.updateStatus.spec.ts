import 'reflect-metadata';
import sift from 'sift';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only the filter that `updateStatus()` hands to
// `ordersService.updateMultiple()` is exercised. `OrdersService` itself is
// real, so its `FindObjects` filters are the ones the server uses.
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
	carrier: string;
	isPaid: boolean;
	isCancelled: boolean;
	carrierStatus: OrderCarrierStatus;
}

describe('CarriersOrdersService.updateStatus', () => {
	const carrierId = 'carrier-1';
	const carrier = { id: carrierId };

	let service: CarriersOrdersService;
	let updateMultiple: jest.Mock;

	beforeEach(() => {
		updateMultiple = jest.fn(async () => []);

		const carriersService = {
			throwIfNotExists: jest.fn(async () => undefined),
			getCurrent: jest.fn(async () => carrier),
			increaseNumberOfDeliveries: jest.fn(async () => carrier),
		};

		service = new CarriersOrdersService(
			carriersService as any,
			{} as any,
			{ updateMultiple } as any,
			{} as any,
			{} as any,
			{} as any
		);
	});

	async function filterUsedFor(status: OrderCarrierStatus) {
		await service.updateStatus(carrierId, status);

		expect(updateMultiple).toHaveBeenCalledTimes(1);

		const [findObj, updateObj] = updateMultiple.mock.calls[0];

		return {
			updateObj,
			matches: (order: SampleOrder) => sift(findObj)(order),
		};
	}

	function carrierOrder(overrides: Partial<SampleOrder> = {}): SampleOrder {
		return {
			carrier: carrierId,
			isPaid: false,
			isCancelled: false,
			carrierStatus: OrderCarrierStatus.CarrierSelectedOrder,
			...overrides,
		};
	}

	it.each([
		['Got product', OrderCarrierStatus.CarrierPickedUpOrder],
		['Start delivery', OrderCarrierStatus.CarrierStartDelivery],
	])(
		'%s updates an order already paid by card',
		async (_label, status: OrderCarrierStatus) => {
			const { matches, updateObj } = await filterUsedFor(status);

			expect(matches(carrierOrder({ isPaid: true }))).toBe(true);
			expect(updateObj).toMatchObject({
				carrierStatus: status,
				startDeliveryTime: expect.any(Number),
			});
		}
	);

	it('still updates an unpaid order of the carrier', async () => {
		const { matches } = await filterUsedFor(
			OrderCarrierStatus.CarrierPickedUpOrder
		);

		expect(matches(carrierOrder())).toBe(true);
	});

	it('leaves out cancelled, delivered and other carriers orders', async () => {
		const { matches } = await filterUsedFor(
			OrderCarrierStatus.CarrierStartDelivery
		);

		expect(matches(carrierOrder({ isPaid: true, isCancelled: true }))).toBe(
			false
		);
		expect(
			matches(
				carrierOrder({
					isPaid: true,
					carrierStatus: OrderCarrierStatus.DeliveryCompleted,
				})
			)
		).toBe(false);
		expect(
			matches(carrierOrder({ isPaid: true, carrier: 'carrier-2' }))
		).toBe(false);
	});

	it.each([
		['returned with an issue', OrderCarrierStatus.IssuesDuringDelivery],
		['refused by the client', OrderCarrierStatus.ClientRefuseTakingOrder],
	])(
		'leaves out an order already %s, paid or not',
		async (_label, finishedStatus: OrderCarrierStatus) => {
			for (const status of [
				OrderCarrierStatus.CarrierPickedUpOrder,
				OrderCarrierStatus.CarrierStartDelivery,
			]) {
				updateMultiple.mockClear();
				const { matches } = await filterUsedFor(status);

				for (const isPaid of [false, true]) {
					expect(
						matches(
							carrierOrder({
								isPaid,
								carrierStatus: finishedStatus,
							})
						)
					).toBe(false);
				}
			}
		}
	);

	it('does not move a paid order in delivery back to picked up', async () => {
		const { matches } = await filterUsedFor(
			OrderCarrierStatus.CarrierPickedUpOrder
		);

		expect(
			matches(
				carrierOrder({
					isPaid: true,
					carrierStatus: OrderCarrierStatus.CarrierStartDelivery,
				})
			)
		).toBe(false);
	});

	it('Start delivery still updates a paid order already picked up', async () => {
		const { matches } = await filterUsedFor(
			OrderCarrierStatus.CarrierStartDelivery
		);

		expect(
			matches(
				carrierOrder({
					isPaid: true,
					carrierStatus: OrderCarrierStatus.CarrierPickedUpOrder,
				})
			)
		).toBe(true);
	});

	it('leaves out an unpaid order already delivered', async () => {
		const { matches } = await filterUsedFor(
			OrderCarrierStatus.CarrierStartDelivery
		);

		expect(
			matches(
				carrierOrder({
					carrierStatus: OrderCarrierStatus.DeliveryCompleted,
				})
			)
		).toBe(false);
	});
});
