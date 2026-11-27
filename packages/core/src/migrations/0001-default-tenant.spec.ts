import { migrateDefaultTenant } from './0001-default-tenant';

type Doc = Record<string, any>;

/** Just enough of a Mongoose Connection for the migration: plain in-memory collections. */
function fakeDb(seed: Record<string, Doc[]>) {
	const data: Record<string, Doc[]> = {};
	for (const [name, docs] of Object.entries(seed)) {
		data[name] = docs.map((doc) => ({ ...doc }));
	}

	const writes: string[] = [];
	const matches = (doc: Doc, filter: Doc) =>
		Object.entries(filter).every(([key, cond]) => {
			if (key === '$or') {
				return (cond as Doc[]).some((sub) => matches(doc, sub));
			}
			if (cond && typeof cond === 'object' && '$exists' in cond) {
				return key in doc === cond.$exists;
			}
			return doc[key] === cond;
		});

	const collection = (name: string) => {
		const docs = (data[name] ??= []);
		return {
			findOne: async (filter: Doc) =>
				docs.find((doc) => matches(doc, filter)) ?? null,
			insertOne: async (doc: Doc) => {
				writes.push(`${name}.insertOne`);
				docs.push(doc);
			},
			countDocuments: async (filter: Doc) =>
				docs.filter((doc) => matches(doc, filter)).length,
			updateMany: async (filter: Doc, update: Doc) => {
				writes.push(`${name}.updateMany`);
				const hit = docs.filter((doc) => matches(doc, filter));
				hit.forEach((doc) => Object.assign(doc, update.$set));
				return { modifiedCount: hit.length };
			},
			updateOne: async (filter: Doc, update: Doc) => {
				writes.push(`${name}.updateOne`);
				const doc = docs.find((d) => matches(d, filter));
				if (doc) {
					Object.assign(doc, update.$set);
				}
			},
			indexes: async () => [],
			dropIndex: async () => undefined,
		};
	};

	const db = {
		collection,
		db: {
			listCollections: () => ({
				toArray: async () =>
					Object.keys(data).map((name) => ({ name })),
			}),
		},
	};

	return { db: db as any, data, writes };
}

const options = (
	overrides: Partial<Parameters<typeof migrateDefaultTenant>[1]>,
) => ({
	adminEmail: 'admin@example.com',
	isProd: true,
	backupConfirmed: false,
	log: () => undefined,
	...overrides,
});

describe('migration 0001 (default tenant)', () => {
	it('in production without a confirmed backup, refuses before writing anything', async () => {
		const { db, data, writes } = fakeDb({
			users: [{ _id: 'u1', email: 'a@example.com' }],
		});

		await expect(migrateDefaultTenant(db, options({}))).rejects.toThrow(
			/MIGRATION_BACKUP_CONFIRMED=true/,
		);

		expect(writes).toEqual([]);
		expect(data.tenants ?? []).toEqual([]);
		expect(data.users[0].tenantId).toBeUndefined();
	});

	it('with a confirmed backup, creates the default tenant and moves the records into it', async () => {
		const { db, data } = fakeDb({
			users: [{ _id: 'u1', email: 'a@example.com' }],
		});

		const result = await migrateDefaultTenant(
			db,
			options({ backupConfirmed: true }),
		);

		expect(data.tenants).toHaveLength(1);
		expect(data.tenants[0]).toMatchObject({
			slug: 'default',
			isPlatform: true,
		});
		expect(data.users[0].tenantId).toBe(result.defaultTenantId);
		expect(result.backfilled).toEqual({ users: 1 });
	});

	it('on an empty production database, needs no backup and creates the default tenant', async () => {
		const { db, data } = fakeDb({});

		await migrateDefaultTenant(db, options({}));

		expect(data.tenants).toHaveLength(1);
	});
});
