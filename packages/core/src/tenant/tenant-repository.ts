import type { Repository } from 'typeorm';
import { TenantContext } from './tenant-context';
import {
	scopeTenantId,
	TENANT_FIELD,
	TenantMismatchError,
} from './tenant-plugin';

type Where = Record<string, any> | Array<Record<string, any>> | undefined;

/**
 * A TypeORM repository limited to the current tenant, for the tenant-owned
 * entities: reads add `tenantId` to `where`, writes stamp it (and refuse
 * another tenant's), updates and deletes only touch the tenant's records.
 * System work (`TenantContext.runAsSystem`) is not limited. Only the
 * methods below exist, so nothing reaches the raw repository by accident.
 */
export class TenantScopedRepository<T extends object> {
	constructor(
		private readonly repository: Repository<T>,
		private readonly what: string,
	) {}

	private where(where: Where): Where {
		const tenantId = scopeTenantId(this.what);

		if (tenantId === undefined) {
			return where;
		}

		if (Array.isArray(where)) {
			return where.map((w) => ({ ...w, [TENANT_FIELD]: tenantId }));
		}

		return { ...(where ?? {}), [TENANT_FIELD]: tenantId };
	}

	private stamp<E>(entity: E): E {
		if (TenantContext.isSystem()) {
			return entity;
		}

		const tenantId = TenantContext.requireTenantId(this.what);
		const current = (entity as any)?.[TENANT_FIELD];

		if (current != null && String(current) !== tenantId) {
			throw new TenantMismatchError(this.what);
		}

		return { ...(entity as any), [TENANT_FIELD]: tenantId };
	}

	private criteria(criteria: any): Where {
		if (
			criteria == null ||
			typeof criteria !== 'object' ||
			Array.isArray(criteria)
		) {
			// an id (or ids): match by id inside the tenant
			return this.where(
				Array.isArray(criteria)
					? { _id: { $in: criteria } }
					: { _id: criteria },
			);
		}

		return this.where(criteria);
	}

	find(options: { where?: Where; [key: string]: any } = {}) {
		return this.repository.find({
			...options,
			where: this.where(options.where),
		} as any);
	}

	findBy(where: Where) {
		return this.repository.findBy(this.where(where) as any);
	}

	findOne(options: { where?: Where; [key: string]: any } = {}) {
		return this.repository.findOne({
			...options,
			where: this.where(options.where),
		} as any);
	}

	findOneBy(where: Where) {
		return this.repository.findOneBy(this.where(where) as any);
	}

	count(options: { where?: Where; [key: string]: any } = {}) {
		return this.repository.count({
			...options,
			where: this.where(options.where),
		} as any);
	}

	countBy(where: Where) {
		return this.repository.countBy(this.where(where) as any);
	}

	save(entity: T | T[]) {
		const stamped = Array.isArray(entity)
			? entity.map((e) => this.stamp(e))
			: this.stamp(entity);

		return this.repository.save(stamped as any);
	}

	insert(entity: T | T[]) {
		const stamped = Array.isArray(entity)
			? entity.map((e) => this.stamp(e))
			: this.stamp(entity);

		return this.repository.insert(stamped as any);
	}

	update(criteria: any, partial: Record<string, any>) {
		const { [TENANT_FIELD]: _ignored, ...rest } = partial ?? {};
		return this.repository.update(
			this.criteria(criteria) as any,
			rest as any,
		);
	}

	delete(criteria: any) {
		return this.repository.delete(this.criteria(criteria) as any);
	}
}
