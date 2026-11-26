import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { TenantContext, TenantCtx } from '../../tenant/tenant-context';
import { GRAPHQL_ACCESS, GraphQLAccess } from './graphql-access';

const ROOT_TYPES = new Set(['Query', 'Mutation', 'Subscription']);

/** Whether `ctx` may run an operation with `access` (see GRAPHQL_ACCESS). */
export function isAllowed(access: GraphQLAccess | undefined, ctx: TenantCtx | undefined): boolean {
	if (access === undefined) {
		return false;
	}

	if (access === 'platform') {
		return true;
	}

	if (ctx?.tenantId == null) {
		return false;
	}

	if (access === 'public') {
		return true;
	}

	const actor = ctx.actor;

	if (actor == null) {
		return false;
	}

	if (access === 'superAdmin') {
		return actor.role === 'admin' && actor.isSuperAdmin === true;
	}

	if (!access.roles.includes(actor.role)) {
		return false;
	}

	if (actor.role === 'admin' && access.adminRoles && !actor.isSuperAdmin) {
		return access.adminRoles.includes(actor.tenantRole ?? 'admin');
	}

	return true;
}

/**
 * Global guard of every GraphQL operation: default deny, then the
 * GRAPHQL_ACCESS table. Field resolvers of object types are not checked
 * (their parent operation was).
 */
@Injectable()
export class GraphQLAccessGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		if (context.getType<GqlContextType>() !== 'graphql') {
			return true;
		}

		const gql = GqlExecutionContext.create(context);
		const info = gql.getInfo();

		if (!info || !ROOT_TYPES.has(info.parentType?.name)) {
			return true;
		}

		const access = GRAPHQL_ACCESS[info.fieldName];
		const ctx: TenantCtx | undefined =
			TenantContext.current() ?? gql.getContext()?.tenantCtx;

		if (isAllowed(access, ctx)) {
			return true;
		}

		if (access !== undefined && access !== 'platform' && ctx?.tenantId == null) {
			throw new ForbiddenException(
				'No tenant: send the Tenant-Id header, use the tenant host name or log in'
			);
		}

		if (access !== undefined && access !== 'public' && ctx?.actor == null) {
			throw new UnauthorizedException(`Log in to use ${info.fieldName}`);
		}

		throw new ForbiddenException(`Not allowed: ${info.fieldName}`);
	}
}
