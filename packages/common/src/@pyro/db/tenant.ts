import { Column } from 'typeorm';
import { Schema } from './schema';

/** Name of the field that holds the owning tenant on every tenant-owned record. */
export const TENANT_ID_FIELD = 'tenantId';

/**
 * Marks the property as the owning tenant of a tenant-owned entity: a
 * required, indexed string in Mongo (the tenant's id) and a TypeORM column.
 * Its presence in a schema is what makes the API's tenant plugin filter every
 * query on that collection by the current tenant.
 */
export function TenantId(): PropertyDecorator {
	const schema = Schema({ type: String, required: true, index: true });
	const column = Column();

	return (target: object, propertyKey: string | symbol) => {
		schema(target, propertyKey);
		column(target, propertyKey);
	};
}
