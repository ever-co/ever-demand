import 'reflect-metadata';

// Keep the heavy service graph (mongoose models, env, router wiring) out of
// this unit test: only `updateCarrier()` is exercised, against stub services.
jest.mock('../../../services/carriers', () => ({ CarriersService: class {} }));
jest.mock('../../../services/devices', () => ({ DevicesService: class {} }));

import { CarrierResolver } from '../../../graphql/carriers/carrier.resolver';

describe('CarrierResolver.updateCarrier skippedOrderIds', () => {
	const id = 'carrier-1';
	const orderId = '5c4f1b3e2d4a1b0012345678';

	let resolver: CarrierResolver;
	let update: jest.Mock;

	beforeEach(() => {
		update = jest.fn(async (_id, updateInput) => ({ id, ...updateInput }));

		const carriersService = {
			throwIfNotExists: jest.fn(async () => undefined),
			update,
		};

		resolver = new CarrierResolver(carriersService as any, {} as any);
	});

	it('rejects a bad skipped order id and names it', async () => {
		await expect(
			resolver.updateCarrier(undefined, {
				id,
				updateInput: { skippedOrderIds: [orderId, 'x'] },
			})
		).rejects.toThrow("'x'");

		expect(update).not.toHaveBeenCalled();
	});

	it('still updates with valid skipped ids or none', async () => {
		await resolver.updateCarrier(undefined, {
			id,
			updateInput: { skippedOrderIds: [orderId] },
		});
		await resolver.updateCarrier(undefined, {
			id,
			updateInput: { firstName: 'New' },
		});

		expect(update).toHaveBeenCalledTimes(2);
		expect(update.mock.calls[0]).toEqual([
			id,
			{ skippedOrderIds: [orderId] },
		]);
	});
});
