import mongoose from 'mongoose';
import Tenant from '@modules/server.common/entities/Tenant';
import { getModel } from '@pyro/db-server/model';
import { env } from '../env';

/** Slugs nobody can sign up with (platform hosts and words that would confuse). */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
	'app',
	'api',
	'www',
	'admin',
	'default',
	'platform',
	'mail',
	'email',
	'static',
	'cdn',
	'assets',
	'status',
	'docs',
	'help',
	'support',
	'billing',
	'auth',
	'login',
	'signup',
	'register',
	'dashboard',
	'shop',
	'store',
	'merchant',
	'carrier',
	'demo',
	'test',
	'stage',
	'staging',
	'dev',
	'ws',
	'graphql',
	'socket',
	'everdemand',
	'ever',
]);

/** Host labels of the platform itself: never a tenant sub-domain. */
const PLATFORM_HOST_LABELS = new Set(['app', 'api', 'www', 'admin']);

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

export function isValidSlug(slug: string): boolean {
	return typeof slug === 'string' && SLUG_PATTERN.test(slug) && !slug.includes('--');
}

export function isAvailableSlug(slug: string): boolean {
	return isValidSlug(slug) && !RESERVED_SLUGS.has(slug);
}

/** Host name without port, lower case; '' when there is none. */
export function hostName(hostOrUrl: string | undefined | null): string {
	if (!hostOrUrl) {
		return '';
	}

	let host = String(hostOrUrl).trim().toLowerCase();

	if (host.includes('://')) {
		try {
			host = new URL(host).hostname;
		} catch {
			return '';
		}
	}

	return host.replace(/:\d+$/, '').replace(/\.$/, '');
}

/**
 * The tenant slug of `host` when it is `<slug>.<baseDomain>` (one label),
 * else null. Platform hosts (app., api., www., admin.) give null.
 */
export function slugFromHost(host: string, baseDomain: string): string | null {
	const name = hostName(host);
	const base = hostName(baseDomain);

	if (!name || !base || !name.endsWith(`.${base}`)) {
		return null;
	}

	const label = name.slice(0, -(base.length + 1));

	if (label.includes('.') || PLATFORM_HOST_LABELS.has(label)) {
		return null;
	}

	return isValidSlug(label) ? label : null;
}

const CACHE_TTL_MS = 30_000;

interface CacheEntry {
	tenant: Tenant | null;
	at: number;
}

/**
 * Reads tenants (a global collection) with a short cache. Every request
 * resolves its tenant here, so lookups must be cheap.
 */
export class TenantDirectory {
	private readonly cache = new Map<string, CacheEntry>();

	private defaultTenantId: string | null = null;

	private get Model(): mongoose.Model<any> {
		return getModel(Tenant) as any;
	}

	private async cached(
		key: string,
		load: () => Promise<any>
	): Promise<Tenant | null> {
		const hit = this.cache.get(key);

		if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
			return hit.tenant;
		}

		const raw = await load();
		const tenant = raw && !raw.isDeleted ? new Tenant(raw) : null;

		this.cache.set(key, { tenant, at: Date.now() });

		return tenant;
	}

	async byId(id: string): Promise<Tenant | null> {
		if (!OBJECT_ID_PATTERN.test(String(id))) {
			return null;
		}

		return this.cached(`id:${id}`, () =>
			this.Model.findById(id).lean().exec()
		);
	}

	async bySlug(slug: string): Promise<Tenant | null> {
		const normalized = String(slug).trim().toLowerCase();

		if (!isValidSlug(normalized)) {
			return null;
		}

		return this.cached(`slug:${normalized}`, () =>
			this.Model.findOne({ slug: normalized }).lean().exec()
		);
	}

	/** A tenant by id (24 hex characters) or by slug. */
	async byKey(key: string): Promise<Tenant | null> {
		const value = String(key ?? '').trim();

		if (!value) {
			return null;
		}

		return OBJECT_ID_PATTERN.test(value)
			? this.byId(value)
			: this.bySlug(value);
	}

	/** The tenant of a host: `<slug>.TENANT_BASE_DOMAIN`, or a custom domain. */
	async byHost(host: string): Promise<Tenant | null> {
		const name = hostName(host);

		if (!name) {
			return null;
		}

		const slug = slugFromHost(name, env.TENANT_BASE_DOMAIN);

		if (slug) {
			return this.bySlug(slug);
		}

		if (env.TENANT_BASE_DOMAIN && name.endsWith(env.TENANT_BASE_DOMAIN)) {
			// app.everdemand.co, api.everdemand.co, ...
			return null;
		}

		if (name === 'localhost' || /^[\d.]+$/.test(name) || name.includes(':')) {
			return null;
		}

		return this.cached(`domain:${name}`, () =>
			this.Model.findOne({ 'settings.domains': name }).lean().exec()
		);
	}

	setDefaultTenantId(id: string) {
		this.defaultTenantId = id;
	}

	/** Id of the default (platform) tenant; set at boot by the migration. */
	getDefaultTenantId(): string | null {
		return this.defaultTenantId;
	}

	invalidate(tenant?: { id?: string; slug?: string } | null) {
		if (!tenant) {
			this.cache.clear();
			return;
		}

		for (const [key, entry] of this.cache) {
			if (
				key === `id:${tenant.id}` ||
				key === `slug:${tenant.slug}` ||
				entry.tenant?.id === tenant.id
			) {
				this.cache.delete(key);
			}
		}
	}
}

export const tenantDirectory = new TenantDirectory();
