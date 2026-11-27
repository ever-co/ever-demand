import 'reflect-metadata';
import { Types } from 'mongoose';

// The counters run through the real DBService, on a fake mongoose model that
// checks a filter and writes in one step per call, as MongoDB does for a
// document. A concurrent write lands right after the first call of the
// method. A decrease must be one write whose answer decides the result: with
// a read, then a write, the read could refuse it while the write still takes
// the stock.
jest.mock('@pyro/io', () => ({
	asyncListener: () => () => undefined,
	observableListener: () => () => undefined,
	routerName: () => () => undefined,
	serialization: () => () => undefined,
}));
jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => ({ info: jest.fn(), error: jest.fn() }),
}));
jest.mock('../../../services/warehouses/WarehousesService', () => ({
	WarehousesService: class {},
}));

import Warehouse from '@modules/server.common/entities/Warehouse';
import { DBService } from '../../../@pyro/db-server/db-service';
import { WarehousesProductsService } from '../../../services/warehouses/WarehousesProductsService';

const STORE_ID = new Types.ObjectId().toHexString();
const PRODUCT_ID = new Types.ObjectId().toHexString();

const same = (value: unknown, condition: any): boolean => {
	if (condition != null && typeof condition === 'object') {
		if ('$in' in condition) {
			return condition.$in.some(
				(c: unknown) => String(c) === String(value),
			);
		}
		if ('$eq' in condition) {
			return value === condition.$eq;
		}
		if ('$gte' in condition) {
			return (value as number) >= condition.$gte;
		}
	}
	return String(value) === String(condition);
};

function createFakeModel(initial: { count: number; soldCount: number }) {
	const doc: Record<string, any> = {
		_id: STORE_ID,
		isDeleted: false,
		products: [
			{
				_id: new Types.ObjectId().toHexString(),
				product: PRODUCT_ID,
				price: 10,
				initialPrice: 10,
				count: initial.count,
				soldCount: initial.soldCount,
				isDeliveryRequired: true,
			},
		],
	};
	let concurrentWrite: (() => void) | undefined;

	/** Index of the matched product (`products.$`), 0 without one, or -1. */
	const match = (filter: Record<string, any>): number => {
		let index = 0;
		for (const [path, condition] of Object.entries(filter)) {
			if (path === 'products') {
				index = doc.products.findIndex((p: any) =>
					Object.entries(condition.$elemMatch).every(([f, c]) =>
						same(p[f], c),
					),
				);
				if (index === -1) return -1;
			} else if (!same(doc[path], condition)) {
				return -1;
			}
		}
		return index;
	};
	const write = (index: number, update: Record<string, any>) => {
		for (const [op, fields] of Object.entries(update)) {
			for (const [path, value] of Object.entries(fields as object)) {
				const field = path.replace(/^products\.\$\./, '');
				doc.products[index][field] =
					op === '$inc' ? doc.products[index][field] + value : value;
			}
		}
	};
	const copy = () => JSON.parse(JSON.stringify(doc));
	/** Answers a call, then lets the concurrent write land. */
	const answer = async <R>(value: R): Promise<R> => {
		const landing = concurrentWrite;
		concurrentWrite = undefined;
		landing?.();
		return value;
	};
	const query = (run: () => unknown) => ({
		lean: () => ({ exec: () => answer(run()) }),
		exec: () => answer(run()),
	});

	const Model = {
		find: jest.fn((filter: any) =>
			query(() => (match(filter) === -1 ? [] : [copy()])),
		),
		findById: jest.fn(() => query(() => copy())),
		updateMany: jest.fn((filter: any, update: any) =>
			query(() => {
				const index = match(filter);
				if (index === -1) return { matchedCount: 0 };
				write(index, update);
				return { matchedCount: 1 };
			}),
		),
		findOneAndUpdate: jest.fn((filter: any, update: any) =>
			query(() => {
				const index = match(filter);
				if (index === -1) return null;
				const before = copy();
				write(index, update);
				return before;
			}),
		),
	};

	return {
		Model,
		product: () => doc.products[0],
		landsAfterFirstCall: (write: () => void) => (concurrentWrite = write),
	};
}

class FakeWarehousesService extends DBService<Warehouse> {
	public readonly DBObject: any = Warehouse;
	protected readonly log: any = { info: jest.fn(), error: jest.fn() };

	constructor(private readonly fakeModel: any) {
		super();
	}

	get Model(): any {
		return this.fakeModel;
	}
}

describe('WarehousesProductsService refused decreases write nothing (through the real DBService)', () => {
	it.each([
		[
			'decreaseCount',
			'count',
			'Request to remove more products than available',
		],
		[
			'decreaseSoldCount',
			'soldCount',
			'Request to decrease count of more products than available',
		],
	] as const)(
		'%s(3) on 2 while an increase of 5 lands right after the first call',
		async (method, field, refusal) => {
			const fake = createFakeModel({ count: 2, soldCount: 2 });
			const warehouses = new FakeWarehousesService(fake.Model);
			const service = new WarehousesProductsService(warehouses as any);
			const events: any[] = [];
			warehouses.existence.subscribe((event) => events.push(event));

			fake.landsAfterFirstCall(() => (fake.product()[field] += 5));

			let result: string;
			try {
				const updated = await service[method](STORE_ID, PRODUCT_ID, 3);
				result = `took 3, now ${updated[field]}`;
			} catch (err) {
				result = (err as Error).message;
			}

			// Either the write took 3 and says so, or it was refused and the
			// stock holds only the concurrent increase.
			if (result === refusal) {
				expect(fake.product()[field]).toBe(7);
				expect(events).toHaveLength(0);
			} else {
				expect(result).toBe('took 3, now 4');
				expect(fake.product()[field]).toBe(4);
				expect(events).toHaveLength(1);
			}
		},
	);

	it('a decrease that matched sends one update event with the value before and after', async () => {
		const fake = createFakeModel({ count: 10, soldCount: 0 });
		const warehouses = new FakeWarehousesService(fake.Model);
		const service = new WarehousesProductsService(warehouses as any);
		const events: any[] = [];
		warehouses.existence.subscribe((event) => events.push(event));

		const updated = await service.decreaseCount(STORE_ID, PRODUCT_ID, 2);

		expect(updated.count).toBe(8);
		expect(fake.product().count).toBe(8);
		expect(events).toHaveLength(1);
		expect(events[0].id).toBe(STORE_ID);
		expect(events[0].lastValue.products[0].count).toBe(10);
		expect(events[0].value.products[0].count).toBe(8);
	});
});
