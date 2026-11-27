import type { Connection } from 'mongoose';
import { Types } from 'mongoose';

/**
 * Collections of the tenant-owned entities (Mongoose names of the models with
 * a `tenantId` field). Kept as plain names so the migration runs on the raw
 * driver, before any model is compiled.
 */
export const TENANT_COLLECTIONS = [
	'admins',
	'carriers',
	'devices',
	'invites',
	'inviterequests',
	'orders',
	'products',
	'productscategories',
	'promotions',
	'users',
	'warehouses',
] as const;

/** Global unique indexes that become per-tenant (compound with tenantId). */
const INDEXES_TO_DROP: Array<[collection: string, index: string]> = [
	['users', 'email_1'],
	['warehouses', 'barcodeData_1'],
	['carriers', 'email_1'],
];

export const DEFAULT_TENANT_SLUG = 'default';

export interface DefaultTenantMigrationOptions {
	/** Email of the first admin (ADMIN_EMAIL): becomes owner + super-admin */
	adminEmail: string;
	isProd: boolean;
	backupConfirmed: boolean;
	log: (message: string) => void;
}

export interface DefaultTenantMigrationResult {
	defaultTenantId: string;
	backfilled: Record<string, number>;
	droppedIndexes: string[];
}

async function collectionNames(db: Connection): Promise<Set<string>> {
	const collections = await db.db
		.listCollections({}, { nameOnly: true })
		.toArray();
	return new Set(collections.map((c) => c.name));
}

/**
 * 0001: every record that has no tenant goes to the default tenant.
 *
 * Idempotent: creates the default tenant only when missing, fills
 * `tenantId` only where it is missing, drops an index only when it exists.
 * Deletes no record. In production it refuses to touch existing records
 * until MIGRATION_BACKUP_CONFIRMED=true says a backup was taken.
 */
export async function migrateDefaultTenant(
	db: Connection,
	options: DefaultTenantMigrationOptions,
): Promise<DefaultTenantMigrationResult> {
	const existing = await collectionNames(db);
	const defaultTenant = await ensureDefaultTenant(db, options);
	const defaultTenantId = String(defaultTenant._id);

	const pending = await recordsWithoutTenant(db, existing);
	const pendingTotal = Object.values(pending).reduce((a, b) => a + b, 0);

	if (pendingTotal > 0 && options.isProd && !options.backupConfirmed) {
		throw new Error(
			`Multi-tenant migration: ${pendingTotal} existing records need a tenant ` +
				`(${JSON.stringify(pending)}). Take a database backup (mongodump), then set ` +
				'MIGRATION_BACKUP_CONFIRMED=true and restart.',
		);
	}

	const backfilled = await backfillTenant(
		db,
		Object.keys(pending),
		defaultTenantId,
		options,
	);

	if (existing.has('admins')) {
		await setAdminRoles(db, defaultTenant, options);
	}

	const droppedIndexes = await dropGlobalUniqueIndexes(db, existing, options);

	return { defaultTenantId, backfilled, droppedIndexes };
}

/** The default (platform) tenant, created when missing. */
async function ensureDefaultTenant(
	db: Connection,
	options: DefaultTenantMigrationOptions,
) {
	const tenants = db.collection('tenants');
	const found = await tenants.findOne({
		$or: [{ isPlatform: true }, { slug: DEFAULT_TENANT_SLUG }],
	});

	if (found) {
		return found;
	}

	const now = new Date();
	const doc = {
		_id: new Types.ObjectId(),
		name: 'Default',
		slug: DEFAULT_TENANT_SLUG,
		status: 'active',
		plan: 'enterprise',
		billing: {},
		settings: {},
		isPlatform: true,
		isDeleted: false,
		_createdAt: now,
		_updatedAt: now,
	};

	await tenants.insertOne(doc);
	options.log(`created the default tenant ${doc._id}`);

	return doc as any;
}

/** How many records of each tenant-owned collection have no tenant yet. */
async function recordsWithoutTenant(db: Connection, existing: Set<string>) {
	const pending: Record<string, number> = {};

	for (const name of TENANT_COLLECTIONS) {
		if (!existing.has(name)) {
			continue;
		}

		const count = await db
			.collection(name)
			.countDocuments({ tenantId: { $exists: false } });

		if (count > 0) {
			pending[name] = count;
		}
	}

	return pending;
}

async function backfillTenant(
	db: Connection,
	names: string[],
	defaultTenantId: string,
	options: DefaultTenantMigrationOptions,
) {
	const backfilled: Record<string, number> = {};

	for (const name of names) {
		const res = await db
			.collection(name)
			.updateMany(
				{ tenantId: { $exists: false } },
				{ $set: { tenantId: defaultTenantId } },
			);

		backfilled[name] = res.modifiedCount;
		options.log(
			`${name}: ${res.modifiedCount} records moved to the default tenant`,
		);
	}

	return backfilled;
}

/**
 * The first admin (ADMIN_EMAIL) becomes the owner of the default tenant;
 * every other admin without a role becomes an admin. Nobody becomes a
 * super-admin here: only SUPER_ADMIN_EMAIL does, at boot (admins/super-admin.ts).
 */
async function setAdminRoles(
	db: Connection,
	defaultTenant: any,
	options: DefaultTenantMigrationOptions,
) {
	const admins = db.collection('admins');
	const first = await admins.findOne({
		email: options.adminEmail,
		tenantId: String(defaultTenant._id),
	});

	if (first) {
		await admins.updateOne(
			{ _id: first._id, role: { $exists: false } },
			{ $set: { role: 'owner' } },
		);
		await db
			.collection('tenants')
			.updateOne(
				{ _id: defaultTenant._id, ownerId: { $exists: false } },
				{ $set: { ownerId: String(first._id) } },
			);
	}

	await admins.updateMany(
		{ role: { $exists: false } },
		{ $set: { role: 'admin' } },
	);
	await admins.updateMany(
		{ isSuperAdmin: { $exists: false } },
		{ $set: { isSuperAdmin: false } },
	);
}

async function dropGlobalUniqueIndexes(
	db: Connection,
	existing: Set<string>,
	options: DefaultTenantMigrationOptions,
): Promise<string[]> {
	const dropped: string[] = [];

	for (const [name, index] of INDEXES_TO_DROP) {
		if (!existing.has(name)) {
			continue;
		}

		const indexes = await db.collection(name).indexes();

		if (indexes.some((i) => i.name === index)) {
			await db.collection(name).dropIndex(index);
			dropped.push(`${name}.${index}`);
			options.log(
				`dropped the global unique index ${name}.${index} (now per tenant)`,
			);
		}
	}

	return dropped;
}
