import type { Connection } from 'mongoose';
import { env } from '../env';
import { migrateDefaultTenant } from './0001-default-tenant';

const LOCK_ID = 'lock';
const LOCK_STALE_MS = 10 * 60 * 1000;
const WAIT_STEP_MS = 2000;

export interface MigrationsResult {
	defaultTenantId: string;
}

async function acquireLock(db: Connection, owner: string): Promise<boolean> {
	const migrations = db.collection<{
		_id: string;
		owner?: string;
		at?: Date;
	}>('migrations');
	const now = new Date();

	try {
		await migrations.insertOne({ _id: LOCK_ID, owner, at: now });
		return true;
	} catch (err: any) {
		if (err?.code !== 11000) {
			throw err;
		}
	}

	// someone holds it: take it over only when stale (a crashed instance)
	const res = await migrations.updateOne(
		{ _id: LOCK_ID, at: { $lt: new Date(now.getTime() - LOCK_STALE_MS) } },
		{ $set: { owner, at: now } },
	);

	return res.modifiedCount === 1;
}

/**
 * Runs the database migrations once per database: an instance that finds
 * another one migrating waits for it. Called at boot before any model is
 * compiled (models create their indexes when they compile).
 */
export async function runMigrations(
	db: Connection,
	log: (message: string) => void,
): Promise<MigrationsResult> {
	const owner = `${process.pid}-${Date.now()}`;
	const started = Date.now();

	while (!(await acquireLock(db, owner))) {
		if (Date.now() - started > LOCK_STALE_MS + 60_000) {
			throw new Error(
				'Timed out waiting for another instance to run the migrations',
			);
		}

		log('waiting for another instance to finish the migrations');
		await new Promise((r) => setTimeout(r, WAIT_STEP_MS));
	}

	try {
		const result = await migrateDefaultTenant(db, {
			adminEmail: env.ADMIN_EMAIL,
			isProd: env.isProd,
			backupConfirmed: env.MIGRATION_BACKUP_CONFIRMED,
			log,
		});

		await db
			.collection<{ _id: string; doneAt?: Date; result?: unknown }>(
				'migrations',
			)
			.updateOne(
				{ _id: '0001-default-tenant' },
				{
					$set: {
						doneAt: new Date(),
						result: {
							backfilled: result.backfilled,
							droppedIndexes: result.droppedIndexes,
						},
					},
				},
				{ upsert: true },
			);

		return { defaultTenantId: result.defaultTenantId };
	} finally {
		await db
			.collection<{ _id: string; owner?: string }>('migrations')
			.deleteOne({ _id: LOCK_ID, owner });
	}
}
