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
	let carrier: any;

	let service: CarriersOrdersService;
	let updateMultiple: jest.Mock;
	let update: jest.Mock;

	beforeEach(() => {
		carrier = { id: carrierId };
		updateMultiple = jest.fn(async () => []);
		update = jest.fn(async () => undefined);

		const carriersService = {
			throwIfNotExists: jest.fn(async () => undefined),
			getCurrent: jest.fn(async () => carrier),
			increaseNumberOfDeliveries: jest.fn(async () => carrier),
		};

		service = new CarriersOrdersService(
			carriersService as any,
			{} as any,
			{ updateMultiple, update } as any,
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

	describe('delivery time estimate', () => {
		const geoLocation = (lng: number, lat: number) => ({
			loc: { type: 'Point', coordinates: [lng, lat] },
		});

		/**
		 * An order as `updateMultiple` returns it after the status write:
		 * this carrier's, in `status` (Start delivery unless given).
		 */
		const orderFor = (
			id: string,
			customerLocation?: any,
			overrides: any = {}
		) => ({
			id,
			carrierId,
			carrierStatus: OrderCarrierStatus.CarrierStartDelivery,
			user: customerLocation ? { geoLocation: customerLocation } : {},
			...overrides,
		});

		/** The estimate writes: every `updateMultiple` call after the status write. */
		const estimateWrites = () =>
			updateMultiple.mock.calls
				.slice(1)
				.map(([findObj, updateObj]) => ({ findObj, updateObj }));

		it.each([
			['Got product', OrderCarrierStatus.CarrierPickedUpOrder],
			['Start delivery', OrderCarrierStatus.CarrierStartDelivery],
		])(
			'%s stores the time from the carrier to each customer',
			async (_label, status: OrderCarrierStatus) => {
				carrier.geoLocation = geoLocation(0, 0);
				updateMultiple.mockResolvedValue([
					// about 1.1 km and about 11 km away
					orderFor('near', geoLocation(0, 0.01), {
						carrierStatus: status,
					}),
					orderFor('far', geoLocation(0, 0.1), {
						carrierStatus: status,
					}),
				]);

				await service.updateStatus(carrierId, status);

				const writes = estimateWrites();
				expect(writes).toHaveLength(2);
				const [near, far] = writes;

				expect(near.findObj._id).toBe('near');
				expect(far.findObj._id).toBe('far');
				expect(near.updateObj.deliveryTimeEstimate).toBeGreaterThan(0);
				expect(far.updateObj.deliveryTimeEstimate).toBeGreaterThan(
					near.updateObj.deliveryTimeEstimate
				);
				expect(Object.keys(near.updateObj)).toEqual([
					'deliveryTimeEstimate',
				]);
				expect(update).not.toHaveBeenCalled();
			}
		);

		it('writes an estimate only while the order still has this carrier and status', async () => {
			carrier.geoLocation = geoLocation(0, 0);
			updateMultiple.mockResolvedValue([
				orderFor('o1', geoLocation(0, 0.01)),
			]);

			await service.updateStatus(
				carrierId,
				OrderCarrierStatus.CarrierStartDelivery
			);

			const [{ findObj }] = estimateWrites();
			const matches = (order: any) => sift(findObj)(order);
			const inDelivery = {
				_id: 'o1',
				carrier: carrierId,
				carrierStatus: OrderCarrierStatus.CarrierStartDelivery,
				isCancelled: false,
			};

			expect(matches(inDelivery)).toBe(true);
			// delivered, returned or cancelled after the status write
			expect(
				matches({
					...inDelivery,
					carrierStatus: OrderCarrierStatus.DeliveryCompleted,
				})
			).toBe(false);
			expect(
				matches({
					...inDelivery,
					carrierStatus: OrderCarrierStatus.IssuesDuringDelivery,
				})
			).toBe(false);
			expect(matches({ ...inDelivery, isCancelled: true })).toBe(false);
			expect(matches({ ...inDelivery, carrier: 'carrier-2' })).toBe(
				false
			);
		});

		it('skips an order the status write left alone', async () => {
			carrier.geoLocation = geoLocation(0, 0);
			updateMultiple.mockResolvedValue([
				// read by updateMultiple, then delivered before its write
				orderFor('delivered', geoLocation(0, 0.01), {
					carrierStatus: OrderCarrierStatus.DeliveryCompleted,
				}),
				orderFor('moved', geoLocation(0, 0.01)),
			]);

			await service.updateStatus(
				carrierId,
				OrderCarrierStatus.CarrierStartDelivery
			);

			expect(estimateWrites().map((w) => w.findObj._id)).toEqual([
				'moved',
			]);
		});

		it('leaves the estimate alone when the carrier has no location', async () => {
			updateMultiple.mockResolvedValue([
				orderFor('o1', geoLocation(0, 0.01)),
			]);

			await service.updateStatus(
				carrierId,
				OrderCarrierStatus.CarrierStartDelivery
			);

			expect(estimateWrites()).toHaveLength(0);
			expect(update).not.toHaveBeenCalled();
		});

		it('skips an order without a customer location and still estimates the rest', async () => {
			carrier.geoLocation = geoLocation(0, 0);
			updateMultiple.mockResolvedValue([
				orderFor('no-location'),
				orderFor('with-location', geoLocation(0, 0.01)),
			]);

			await service.updateStatus(
				carrierId,
				OrderCarrierStatus.CarrierStartDelivery
			);

			expect(estimateWrites().map((w) => w.findObj._id)).toEqual([
				'with-location',
			]);
		});

		it('does not fail the status change when saving an estimate fails', async () => {
			carrier.geoLocation = geoLocation(0, 0);
			const orders = [
				orderFor('o1', geoLocation(0, 0.01)),
				orderFor('o2', geoLocation(0, 0.02)),
			];
			updateMultiple
				.mockResolvedValueOnce(orders)
				.mockRejectedValueOnce(new Error('db down'))
				.mockResolvedValue(orders);

			await expect(
				service.updateStatus(
					carrierId,
					OrderCarrierStatus.CarrierStartDelivery
				)
			).resolves.toBeDefined();

			expect(estimateWrites()).toHaveLength(2);
		});

		it.each([
			['delivered', OrderCarrierStatus.DeliveryCompleted],
			['returned with an issue', OrderCarrierStatus.IssuesDuringDelivery],
			[
				'refused by the client',
				OrderCarrierStatus.ClientRefuseTakingOrder,
			],
		])(
			'resets the estimate to 0 for an order %s',
			async (_label, status: OrderCarrierStatus) => {
				carrier.geoLocation = geoLocation(0, 0);
				const { updateObj } = await filterUsedFor(status);

				expect(updateObj.deliveryTimeEstimate).toBe(0);
				expect(update).not.toHaveBeenCalled();
			}
		);

		it('does not touch the estimate for other statuses', async () => {
			const { updateObj } = await filterUsedFor(
				OrderCarrierStatus.CarrierArrivedToCustomer
			);

			expect(updateObj).not.toHaveProperty('deliveryTimeEstimate');
			expect(update).not.toHaveBeenCalled();
		});
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
