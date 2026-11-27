import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { TenantContext, TenantCtx } from '../../tenant/tenant-context';
import {
	GRAPHQL_ACCESS,
	GraphQLAccess,
	isAllowed,
	isFieldAllowed,
} from './graphql-access';

export { isAllowed };

const ROOT_TYPES = new Set(['Query', 'Mutation', 'Subscription']);

/**
 * REST controllers (Nest, under /api): who may call them. A controller
 * without an entry is refused.
 */
export const REST_ACCESS: Readonly<Record<string, GraphQLAccess>> = {
	HealthController: 'platform',
	// verified by its Stripe signature
	BillingController: 'platform',
	ProductController: { roles: ['admin', 'warehouse'] },
	TestController: 'superAdmin',
};

/**
 * Global guard of every GraphQL operation: default deny, then the
 * GRAPHQL_ACCESS table; field resolvers of object types (`@ResolveField`,
 * run through the guard by `fieldResolverEnhancers: ['guards']`) by the
 * GRAPHQL_FIELD_ACCESS table.
 */
@Injectable()
export class GraphQLAccessGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const type = context.getType<GqlContextType>();

		if (type === 'http') {
			const name = context.getClass()?.name;
			const access = REST_ACCESS[name];
			const ctx = TenantContext.current();

			if (isAllowed(access, ctx)) {
				return true;
			}

			if (
				access !== undefined &&
				access !== 'public' &&
				access !== 'platform' &&
				ctx?.actor == null
			) {
				throw new UnauthorizedException('Log in first');
			}

			throw new ForbiddenException('Not allowed');
		}

		if (type !== 'graphql') {
			return true;
		}

		const gql = GqlExecutionContext.create(context);
		const info = gql.getInfo();

		if (!info) {
			return true;
		}

		if (!ROOT_TYPES.has(info.parentType?.name)) {
			return this.canResolveField(gql, info);
		}

		const access = GRAPHQL_ACCESS[info.fieldName];
		const ctx: TenantCtx | undefined =
			TenantContext.current() ?? gql.getContext()?.tenantCtx;

		if (isAllowed(access, ctx)) {
			return true;
		}

		if (
			access !== undefined &&
			access !== 'platform' &&
			ctx?.tenantId == null
		) {
			throw new ForbiddenException(
				'No tenant: send the Tenant-Id header, use the tenant host name or log in',
			);
		}

		if (access !== undefined && access !== 'public' && ctx?.actor == null) {
			throw new UnauthorizedException(`Log in to use ${info.fieldName}`);
		}

		throw new ForbiddenException(`Not allowed: ${info.fieldName}`);
	}

	/** A field resolver: GRAPHQL_FIELD_ACCESS, on the parent record. */
	private canResolveField(gql: GqlExecutionContext, info: any): boolean {
		const key = `${info.parentType?.name}.${info.fieldName}`;
		const ctx: TenantCtx | undefined =
			TenantContext.current() ?? gql.getContext()?.tenantCtx;

		if (isFieldAllowed(key, ctx, gql.getRoot())) {
			return true;
		}

		if (ctx?.actor == null) {
			throw new UnauthorizedException(`Log in to read ${key}`);
		}

		throw new ForbiddenException(`Not allowed: ${key}`);
	}
}
