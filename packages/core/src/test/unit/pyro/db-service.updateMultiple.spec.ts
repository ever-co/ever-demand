import 'reflect-metadata';
import { Types } from 'mongoose';
import { DBService } from '../../../@pyro/db-server/db-service';

class FakeDBObject {
	static modelName = 'Fake';

	[key: string]: any;

	constructor(obj: any) {
		Object.assign(this, obj);
	}

	get id(): string {
		return String(this._id);
	}
}

class FakeService extends DBService<any> {
	public readonly DBObject: any = FakeDBObject;

	constructor(
		public readonly log: any,
		private readonly fakeModel: any,
	) {
		super();
	}

	get Model(): any {
		return this.fakeModel;
	}
}

const ID = new Types.ObjectId().toHexString();

const query = (value: unknown) => ({
	lean: () => ({ exec: async () => value }),
});

describe('DBService.updateMultiple', () => {
	let stored: { _id: string; count: number };
	let concurrentWrite: (() => void) | undefined;
	let model: { find: jest.Mock; updateMany: jest.Mock };
	let service: FakeService;
	let events: any[];

	beforeEach(() => {
		stored = { _id: ID, count: 4 };
		concurrentWrite = undefined;
		model = {
			// a filter `{ _id, count: { $gte } }` or `{ _id: { $in } }`
			find: jest.fn((conditions: any) => {
				const ids = conditions._id.$in ?? [conditions._id];
				const found =
					ids.some((id: unknown) => String(id) === ID) &&
					(conditions.count == null ||
						stored.count >= conditions.count.$gte)
						? [{ ...stored }]
						: [];

				// another write lands after this read
				concurrentWrite?.();
				concurrentWrite = undefined;

				return query(found);
			}),
			updateMany: jest.fn((conditions: any, update: any) => ({
				exec: async () => {
					if (stored.count < conditions.count.$gte) {
						return { matchedCount: 0, modifiedCount: 0 };
					}
					stored.count += update.$inc.count;
					return { matchedCount: 1, modifiedCount: 1 };
				},
			})),
		};
		service = new FakeService({ info: jest.fn(), error: jest.fn() }, model);
		events = [];
		service.existence.subscribe((event) => events.push(event));
	});

	it('returns the written objects and sends an update event for each', async () => {
		const updated = await service.updateMultiple(
			{ _id: ID, count: { $gte: 3 } },
			{ $inc: { count: -3 } },
		);

		expect(updated.map((obj) => obj.count)).toEqual([1]);
		expect(events).toHaveLength(1);
		expect(events[0].lastValue.count).toBe(4);
		expect(events[0].value.count).toBe(1);
	});

	it('returns nothing and sends no event when the write matched nothing (a concurrent write changed the object after the read)', async () => {
		concurrentWrite = () => (stored.count = 2);

		const updated = await service.updateMultiple(
			{ _id: ID, count: { $gte: 3 } },
			{ $inc: { count: -3 } },
		);

		expect(stored.count).toBe(2);
		expect(updated).toEqual([]);
		expect(events).toEqual([]);
	});
});
