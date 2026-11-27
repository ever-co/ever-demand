import { Mongoose, Schema } from 'mongoose';
import { TenantContext, TenantContextMissingError } from './tenant-context';
import {
	applyTenantToPipeline,
	scrubTenantFromUpdate,
	tenantPlugin,
	TenantMismatchError,
} from './tenant-plugin';

const A = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const B = 'bbbbbbbbbbbbbbbbbbbbbbbb';

/** A Mongoose instance that never connects: hooks run, then the driver call fails. */
function setup() {
	const mongoose = new Mongoose();
	mongoose.set('bufferCommands', false);
	mongoose.set('strictQuery', true);
	mongoose.plugin(tenantPlugin);

	const Shop = mongoose.model(
		'Shop',
		new Schema({
			name: String,
			tenantId: { type: String, required: true, index: true },
		}),
	);

	const Order = mongoose.model(
		'Order',
		new Schema({
			shop: String,
			tenantId: { type: String, required: true, index: true },
		}),
	);

	const Currency = mongoose.model('Currency', new Schema({ code: String }));

	return { mongoose, Shop, Order, Currency };
}

/** Runs the operation; returns the error it failed with (hooks or driver). */
async function failure(p: PromiseLike<unknown>): Promise<any> {
	try {
		await p;
	} catch (err) {
		return err;
	}

	throw new Error('expected the operation to fail');
}

const isDriverError = (err: any) =>
	!(err instanceof TenantContextMissingError) &&
	!(err instanceof TenantMismatchError) &&
	/initial connection|not connected|bufferCommands/i.test(
		String(err?.message),
	);

// these tests need "no tenant" to mean none (test/unit/setup-tenant.ts sets a fallback)
let savedFallback: string | null;
beforeEach(() => {
	savedFallback = TenantContext.getFallbackTenantId();
	TenantContext.setFallbackTenantId(null);
});
afterEach(() => TenantContext.setFallbackTenantId(savedFallback));

describe('tenantPlugin', () => {
	describe('queries', () => {
		it.each([
			['find', (M) => M.find({ name: 'x' })],
			['findOne', (M) => M.findOne({ name: 'x' })],
			['findById', (M) => M.findById(A)],
			['countDocuments', (M) => M.countDocuments({})],
			['updateOne', (M) => M.updateOne({ name: 'x' }, { name: 'y' })],
			['updateMany', (M) => M.updateMany({}, { $set: { name: 'y' } })],
			['deleteOne', (M) => M.deleteOne({ name: 'x' })],
			['deleteMany', (M) => M.deleteMany({})],
			['findOneAndUpdate', (M) => M.findOneAndUpdate({}, { name: 'y' })],
			['findByIdAndDelete', (M) => M.findByIdAndDelete(A)],
			['distinct', (M) => M.distinct('name')],
			['replaceOne', (M) => M.replaceOne({}, { name: 'y' })],
		])(
			'%s without a tenant throws TenantContextMissingError',
			async (_, op) => {
				const { Shop } = setup();
				const err = await failure(op(Shop).exec());
				expect(err).toBeInstanceOf(TenantContextMissingError);
			},
		);

		it.each([
			['find', (M) => M.find({ name: 'x' })],
			['findOne', (M) => M.findOne({ name: 'x' })],
			['countDocuments', (M) => M.countDocuments({})],
			['updateMany', (M) => M.updateMany({}, { $set: { name: 'y' } })],
			['deleteMany', (M) => M.deleteMany({})],
			['findOneAndUpdate', (M) => M.findOneAndUpdate({}, { name: 'y' })],
		])('%s in tenant A filters by tenant A', async (_, op) => {
			const { Shop } = setup();
			const query = op(Shop);

			const err = await TenantContext.runInTenant(A, () =>
				failure(query.exec()),
			);

			expect(isDriverError(err)).toBe(true);
			expect(query.getFilter().tenantId).toBe(A);
		});

		it('replaces a tenantId filter of the caller with the current tenant', async () => {
			const { Shop } = setup();
			const query = Shop.find({ tenantId: B });

			await TenantContext.runInTenant(A, () => failure(query.exec()));

			expect(query.getFilter().tenantId).toBe(A);
		});

		it('keeps $or conditions and adds the tenant next to them', async () => {
			const { Shop } = setup();
			const query = Shop.find({ $or: [{ name: 'a' }, { name: 'b' }] });

			await TenantContext.runInTenant(A, () => failure(query.exec()));

			expect(query.getFilter()).toEqual({
				$or: [{ name: 'a' }, { name: 'b' }],
				tenantId: A,
			});
		});

		it('never lets an update change tenantId', async () => {
			const { Shop } = setup();
			const query = Shop.updateMany({}, {
				tenantId: B,
				$set: { tenantId: B, name: 'n' },
			} as any);

			await TenantContext.runInTenant(A, () => failure(query.exec()));

			const update: any = query.getUpdate();
			expect(JSON.stringify(update)).not.toContain(B);
			expect(update.$set.name).toBe('n');
		});

		it('keeps a replacement document in the current tenant', async () => {
			const { Shop } = setup();
			const query = Shop.replaceOne({}, { name: 'n', tenantId: B });

			await TenantContext.runInTenant(A, () => failure(query.exec()));

			expect((query.getUpdate() as any).tenantId).toBe(A);
		});

		it('does not filter system work', async () => {
			const { Shop } = setup();
			const query = Shop.find({ name: 'x' });

			const err = await TenantContext.runAsSystem('test', () =>
				failure(query.exec()),
			);

			expect(isDriverError(err)).toBe(true);
			expect(query.getFilter().tenantId).toBeUndefined();
		});

		it('uses the fallback tenant of a single-tenant install', async () => {
			const { Shop } = setup();
			TenantContext.setFallbackTenantId(A);
			const query = Shop.find({});

			const err = await failure(query.exec());

			expect(isDriverError(err)).toBe(true);
			expect(query.getFilter().tenantId).toBe(A);
		});

		it('leaves global collections alone', async () => {
			const { Currency } = setup();
			const query = Currency.find({ code: 'USD' });

			const err = await failure(query.exec());

			expect(isDriverError(err)).toBe(true);
			expect(query.getFilter()).toEqual({ code: 'USD' });
		});

		it('refuses estimatedDocumentCount and bulkWrite in a tenant', async () => {
			const { Shop } = setup();

			await TenantContext.runInTenant(A, async () => {
				expect(
					String(await failure(Shop.estimatedDocumentCount().exec())),
				).toMatch(/countDocuments/);
				expect(String(await failure(Shop.bulkWrite([])))).toMatch(
					/not tenant-scoped/,
				);
			});
		});
	});

	describe('writes', () => {
		it('stamps the current tenant on create', async () => {
			const { Shop } = setup();
			const doc = new Shop({ name: 'n' });

			const err = await TenantContext.runInTenant(A, () =>
				failure(doc.save()),
			);

			expect(isDriverError(err)).toBe(true);
			expect(doc.get('tenantId')).toBe(A);
		});

		it('refuses to create a record in another tenant', async () => {
			const { Shop } = setup();
			const doc = new Shop({ name: 'n', tenantId: B });

			const err = await TenantContext.runInTenant(A, () =>
				failure(doc.save()),
			);

			expect(err).toBeInstanceOf(TenantMismatchError);
		});

		it('refuses to create without a tenant', async () => {
			const { Shop } = setup();
			const err = await failure(new Shop({ name: 'n' }).save());
			expect(err).toBeInstanceOf(TenantContextMissingError);
		});

		it('requires system work to state the tenant', async () => {
			const { Shop } = setup();
			const err = await TenantContext.runAsSystem('test', () =>
				failure(new Shop({ name: 'n' }).save()),
			);
			expect(err?.name).toBe('ValidationError');
		});

		it('stamps every record of insertMany and refuses foreign ones', async () => {
			const { Shop } = setup();
			const docs: any[] = [{ name: 'a' }, { name: 'b' }];

			const err = await TenantContext.runInTenant(A, () =>
				failure(Shop.insertMany(docs)),
			);

			expect(isDriverError(err)).toBe(true);
			expect(docs.map((d) => d.tenantId)).toEqual([A, A]);

			const foreign = await TenantContext.runInTenant(A, () =>
				failure(Shop.insertMany([{ name: 'c', tenantId: B }])),
			);
			expect(foreign).toBeInstanceOf(TenantMismatchError);
		});
	});

	describe('aggregations', () => {
		it('prepends a $match on the tenant', async () => {
			const { Shop } = setup();
			const agg = Shop.aggregate([{ $match: { name: 'x' } }]);

			const err = await TenantContext.runInTenant(A, () =>
				failure(agg.exec()),
			);

			expect(isDriverError(err)).toBe(true);
			expect(agg.pipeline()[0]).toEqual({ $match: { tenantId: A } });
		});

		it('throws without a tenant', async () => {
			const { Shop } = setup();
			const err = await failure(Shop.aggregate([]).exec());
			expect(err).toBeInstanceOf(TenantContextMissingError);
		});

		it('limits $lookup of tenant collections and keeps it off global ones', async () => {
			const { Order } = setup();
			const agg = Order.aggregate([
				{
					$lookup: {
						from: 'shops',
						let: { s: '$shop' },
						pipeline: [
							{ $match: { $expr: { $eq: ['$_id', '$$s'] } } },
						],
						as: 'shop',
					},
				},
				{
					$lookup: {
						from: 'currencies',
						localField: 'c',
						foreignField: 'code',
						as: 'c',
					},
				},
			]);

			await TenantContext.runInTenant(A, () => failure(agg.exec()));

			const [match, shopLookup, currencyLookup] = agg.pipeline() as any[];
			expect(match).toEqual({ $match: { tenantId: A } });
			expect(shopLookup.$lookup.pipeline[0]).toEqual({
				$match: { tenantId: A },
			});
			expect(currencyLookup.$lookup.pipeline).toBeUndefined();
		});

		it('limits the tenant reads of an aggregation on a global collection', async () => {
			const { Currency } = setup();
			const agg = Currency.aggregate([
				{ $lookup: { from: 'orders', pipeline: [], as: 'orders' } },
			]);

			await TenantContext.runInTenant(A, () => failure(agg.exec()));

			// no leading $match (currencies are global), the lookup is in tenant A
			expect(agg.pipeline()).toHaveLength(1);
			expect((agg.pipeline()[0] as any).$lookup.pipeline).toEqual([
				{ $match: { tenantId: A } },
			]);

			// without a tenant it is refused, a purely global aggregation is not
			const refused = await failure(
				Currency.aggregate([
					{ $lookup: { from: 'shops', pipeline: [], as: 's' } },
				]).exec(),
			);
			expect(refused).toBeInstanceOf(TenantContextMissingError);
			expect(
				isDriverError(
					await failure(Currency.aggregate([{ $match: {} }]).exec()),
				),
			).toBe(true);
		});
	});
});

describe('applyTenantToPipeline', () => {
	const collections = new Set(['shops', 'orders']);

	it('injects the tenant into a leading $geoNear instead of moving it', () => {
		const pipeline: any[] = [
			{ $geoNear: { near: [0, 0], key: 'loc', query: { open: true } } },
			{ $limit: 5 },
		];

		applyTenantToPipeline(pipeline, A, collections);

		expect(pipeline).toHaveLength(2);
		expect(pipeline[0].$geoNear.query).toEqual({ open: true, tenantId: A });
	});

	it('limits $unionWith, $graphLookup and $facet sub-pipelines', () => {
		const pipeline: any[] = [
			{ $unionWith: 'orders' },
			{
				$graphLookup: {
					from: 'shops',
					startWith: '$a',
					connectFromField: 'a',
					connectToField: 'b',
					as: 'g',
				},
			},
			{
				$facet: {
					x: [{ $lookup: { from: 'orders', pipeline: [], as: 'o' } }],
				},
			},
		];

		applyTenantToPipeline(pipeline, A, collections);

		expect(pipeline[1].$unionWith).toEqual({
			coll: 'orders',
			pipeline: [{ $match: { tenantId: A } }],
		});
		expect(pipeline[2].$graphLookup.restrictSearchWithMatch).toEqual({
			tenantId: A,
		});
		expect(pipeline[3].$facet.x[0].$lookup.pipeline).toEqual([
			{ $match: { tenantId: A } },
		]);
	});

	it('limits a $lookup nested in a $unionWith of a global collection', () => {
		const pipeline: any[] = [
			{
				$unionWith: {
					coll: 'currencies',
					pipeline: [
						{ $lookup: { from: 'orders', pipeline: [], as: 'o' } },
					],
				},
			},
		];

		applyTenantToPipeline(pipeline, A, collections);

		// the union itself reads a global collection, its nested lookup is scoped
		expect(pipeline[1].$unionWith.coll).toBe('currencies');
		expect(pipeline[1].$unionWith.pipeline[0].$lookup.pipeline).toEqual([
			{ $match: { tenantId: A } },
		]);
	});

	it('refuses $out and $merge', () => {
		expect(() =>
			applyTenantToPipeline([{ $out: 'x' }], A, collections),
		).toThrow(/\$out/);
		expect(() =>
			applyTenantToPipeline([{ $merge: { into: 'x' } }], A, collections),
		).toThrow(/\$merge/);
	});
});

describe('scrubTenantFromUpdate', () => {
	it('drops tenantId from every operator and from $rename targets', () => {
		const update: any = {
			tenantId: B,
			$set: { tenantId: B, a: 1 },
			$setOnInsert: { tenantId: B },
			$unset: { tenantId: 1 },
			$rename: { other: 'tenantId' },
		};

		scrubTenantFromUpdate(update);

		expect(update).toEqual({
			$set: { a: 1 },
			$setOnInsert: {},
			$unset: {},
			$rename: {},
		});
	});

	it('refuses pipeline updates', () => {
		expect(() =>
			scrubTenantFromUpdate([{ $set: { tenantId: B } }]),
		).toThrow(/Pipeline updates/);
	});
});

describe('TenantContext', () => {
	it('keeps the tenant across awaits and isolates concurrent runs', async () => {
		const seen: string[] = [];

		await Promise.all([
			TenantContext.runInTenant(A, async () => {
				await new Promise((r) => setTimeout(r, 5));
				seen.push(TenantContext.requireTenantId());
			}),
			TenantContext.runInTenant(B, async () => {
				seen.push(TenantContext.requireTenantId());
			}),
		]);

		expect(seen.sort()).toEqual([A, B]);
	});

	it('requireTenantId throws without a tenant, and inside system work', () => {
		expect(() => TenantContext.requireTenantId()).toThrow(
			TenantContextMissingError,
		);
		expect(() =>
			TenantContext.runAsSystem('x', () =>
				TenantContext.requireTenantId(),
			),
		).toThrow(TenantContextMissingError);
	});
});
