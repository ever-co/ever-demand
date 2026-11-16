import 'reflect-metadata';
import { DBService } from '../../../@pyro/db-server/db-service';

const HASH = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234';

class FakeDBObject {
	static modelName = 'Fake';

	[key: string]: any;

	constructor(obj: any) {
		Object.assign(this, obj);
	}
}

class FakeService extends DBService<any> {
	public readonly DBObject: any = FakeDBObject;

	constructor(public readonly log: any, private readonly fakeModel: any) {
		super();
	}

	get Model(): any {
		return this.fakeModel;
	}
}

describe('DBService.create', () => {
	let log: { info: jest.Mock; error: jest.Mock };
	let model: { schema: any; create: jest.Mock };
	let service: FakeService;

	const allLoggedText = () =>
		JSON.stringify([...log.info.mock.calls, ...log.error.mock.calls]);

	beforeEach(() => {
		log = { info: jest.fn(), error: jest.fn() };
		model = {
			schema: {
				paths: {
					email: { options: { type: String } },
					hash: { options: { type: String, select: false } },
					name: { options: { type: String, select: true } },
				},
			},
			create: jest.fn(async (obj: any) => ({
				toObject: () => ({ _id: 'id1', ...obj }),
			})),
		};
		service = new FakeService(log, model);
	});

	it('does not return or emit select:false fields', async () => {
		const emitted: any[] = [];
		service.existence.subscribe((event) => emitted.push(event.value));

		const result = await service.create({
			email: 'a@b.c',
			name: 'Ann',
			hash: HASH,
		} as any);

		expect(result.email).toBe('a@b.c');
		expect(result.name).toBe('Ann');
		expect(result).not.toHaveProperty('hash');
		expect(emitted[0]).not.toHaveProperty('hash');
	});

	it('still passes the hash to the model so it is stored', async () => {
		await service.create({ email: 'a@b.c', hash: HASH } as any);

		expect(model.create).toHaveBeenCalledWith({
			email: 'a@b.c',
			hash: HASH,
		});
	});

	it('never logs the hash on success', async () => {
		await service.create({ email: 'a@b.c', hash: HASH } as any);

		expect(log.info).toHaveBeenCalledTimes(2);
		expect(allLoggedText()).not.toContain(HASH);
		expect(allLoggedText()).toContain('a@b.c');
	});

	it('never logs the hash when the model throws', async () => {
		model.create.mockRejectedValue(new Error('boom'));

		await expect(
			service.create({ email: 'a@b.c', hash: HASH } as any)
		).rejects.toThrow('boom');

		expect(log.error).toHaveBeenCalledTimes(1);
		expect(allLoggedText()).not.toContain(HASH);
	});

	it('keeps all fields when the schema has no select:false paths', async () => {
		model.schema = { paths: { email: { options: {} } } };

		const result = await service.create({ email: 'a@b.c', hash: 'x' } as any);

		expect(result.hash).toBe('x');
	});
});
