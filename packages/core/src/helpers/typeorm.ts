import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import type { MongoDataSourceOptions } from 'typeorm/driver/mongodb/MongoDataSourceOptions';
import Admin from '@modules/server.common/entities/Admin';
import Device from '@modules/server.common/entities/Device';
import Carrier from '@modules/server.common/entities/Carrier';
import Invite from '@modules/server.common/entities/Invite';
import InviteRequest from '@modules/server.common/entities/InviteRequest';
import Order from '@modules/server.common/entities/Order';
import Product from '@modules/server.common/entities/Product';
import ProductsCategory from '@modules/server.common/entities/ProductsCategory';
import User from '@modules/server.common/entities/User';
import Warehouse from '@modules/server.common/entities/Warehouse';
import Promotion from '@modules/server.common/entities/Promotion';
import { env } from '../env';

// TODO: put to config
const CONNECT_TIMEOUT_MS = 40000;

/** Entities that get a TypeORM repository. */
export function getTypeORMEntities() {
	return [
		Admin,
		Carrier,
		Device,
		Invite,
		InviteRequest,
		Order,
		Product,
		ProductsCategory,
		User,
		Warehouse,
		Promotion,
	];
}

/** Whether the database connection uses TLS (env DB_SSL_MODE set and not "false"). */
export function isDbSsl(): boolean {
	const mode = process.env.DB_SSL_MODE;
	return !!mode && mode !== 'false';
}

/**
 * Writes the CA certificate given (base64) in DB_CA_CERT to the logs folder,
 * where the API always has write access, and returns its path.
 */
export function writeDbCaCert(): string {
	const sslCertPath = `${env.LOGS_PATH}/ca-certificate.crt`;
	const base64data = process.env.DB_CA_CERT || '';
	fs.mkdirSync(path.dirname(sslCertPath), { recursive: true });
	fs.writeFileSync(
		sslCertPath,
		Buffer.from(base64data, 'base64').toString('ascii')
	);
	return sslCertPath;
}

/**
 * The TLS options of both database connections (Mongoose and TypeORM).
 * With DB_SSL_MODE set: TLS, trusting the CA in DB_CA_CERT when one is given,
 * else the system CAs. Without it: nothing, so DB_URI decides (for example
 * `?tls=true&tlsCAFile=...` for DocumentDB's gateway, which only speaks TLS).
 */
export function dbTlsOptions(): { tls?: true; tlsCAFile?: string } {
	if (!isDbSsl()) {
		return {};
	}

	return process.env.DB_CA_CERT
		? { tls: true, tlsCAFile: writeDbCaCert() }
		: { tls: true };
}

/**
 * TypeORM (MongoDB) connection options, shared by the bootstrap connection
 * (used by the inversify repositories) and the NestJS TypeOrmModule.
 */
export function getTypeORMOptions(): MongoDataSourceOptions {
	return {
		type: 'mongodb',
		url: env.DB_URI,
		...dbTlsOptions(),
		host: process.env.DB_HOST || 'localhost',
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME || 'ever_development',
		port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 27017,
		entities: getTypeORMEntities(),
		synchronize: true,
		connectTimeoutMS: CONNECT_TIMEOUT_MS,
		logging: true,
		// Logs all queries into ormlogs.log instead of the console
		logger: 'file',
	};
}

let bootstrapDataSource: DataSource | undefined;

/**
 * Creates and connects the TypeORM DataSource used by our inversify services
 * (see services/inversify.config.ts). NestJS creates its own one from the same
 * options through TypeOrmModule.forRoot (see app.module.ts).
 */
export async function initTypeORMDataSource(): Promise<DataSource> {
	if (bootstrapDataSource?.isInitialized) {
		return bootstrapDataSource;
	}

	bootstrapDataSource = new DataSource(getTypeORMOptions());
	await bootstrapDataSource.initialize();

	return bootstrapDataSource;
}

/** The DataSource created by initTypeORMDataSource(). */
export function getTypeORMDataSource(): DataSource {
	if (!bootstrapDataSource?.isInitialized) {
		throw new Error(
			'TypeORM DataSource is not initialized: call initTypeORMDataSource() first'
		);
	}
	return bootstrapDataSource;
}

export async function closeTypeORMDataSource(): Promise<void> {
	if (bootstrapDataSource?.isInitialized) {
		await bootstrapDataSource.destroy();
	}
	bootstrapDataSource = undefined;
}
