import { IListenerHandler } from './handler';
import { getRouterName, IRouter } from '../../router/router';
import Logger from 'bunyan';
import { getListenerType, Listener } from '../listener';
import { ListenerType } from '../types';
import { getListenerSerializer } from '../serialization';
import * as _ from 'lodash';
import getArgsNames from '@captemulation/get-parameter-names';
import { Socket } from 'socket.io';
import {
	TenantContext,
	TenantContextMissingError,
} from '../../../../tenant/tenant-context';
import {
	hasSocketTenantInfo,
	recheckSocketAccess,
	socketTenantCtx,
} from '../../../../tenant/tenant-socket';
import type { TenantCtx } from '../../../../tenant/tenant-context';
import { isAllowed } from '../../../../graphql/access/graphql-access';
import { SOCKET_ACCESS, socketAccessKey } from '../../access/socket-access';

/** A socket may not call this listener (SOCKET_ACCESS). */
export class SocketAccessError extends Error {
	readonly name = 'SocketAccessError';
}

const MASKED_VALUE = '***';

const MAX_MASK_DEPTH = 20;

/**
 * Keys whose values never reach the logs: passwords (`password`,
 * `currentPassword`, ...), secrets, password hashes (`hash`) and auth tokens
 * (`token`, `accessToken`, ...). Case-insensitive.
 */
const SECRET_KEY = /password|secret|^hash$|token$/i;

export function isSecretKey(key: string): boolean {
	return SECRET_KEY.test(key);
}

/**
 * Returns a deep copy of `value` where the value of every secret key (see
 * `isSecretKey`), at any depth, is replaced with a mask, so passwords,
 * password hashes and auth tokens never reach the logs. Objects are never
 * mutated.
 */
export function maskPasswords(
	value: any,
	seen = new WeakSet<object>(),
	depth = 0
): any {
	if (value === null || typeof value !== 'object') {
		return value;
	}

	// Bounds the recursion so a hostile, deeply nested argument cannot
	// overflow the stack inside logCall. Anything deeper is not logged.
	if (depth >= MAX_MASK_DEPTH) {
		return '[Truncated]';
	}

	if (seen.has(value)) {
		return '[Circular]';
	}

	if (value instanceof Date || Buffer.isBuffer(value)) {
		return value;
	}

	// ObjectIds, mongoose documents and other objects with their own JSON
	// form are logged as that form, as JSON.stringify (and bunyan) would.
	if (
		!Array.isArray(value) &&
		!_.isPlainObject(value) &&
		typeof value.toJSON === 'function'
	) {
		const json = value.toJSON();

		if (json !== value) {
			return maskPasswords(json, seen, depth + 1);
		}
	}

	seen.add(value);

	let masked: any;

	if (Array.isArray(value)) {
		masked = value.map((item) => maskPasswords(item, seen, depth + 1));
	} else {
		masked = {};

		for (const key of Object.keys(value)) {
			masked[key] = isSecretKey(key)
				? MASKED_VALUE
				: maskPasswords(value[key], seen, depth + 1);
		}
	}

	seen.delete(value);

	return masked;
}

export abstract class BaseListenerHandler<T> implements IListenerHandler<T> {
	protected readonly serializer: (args: any[]) => any[];

	protected readonly routerName: string = getRouterName(this._router);

	protected readonly listenerType: ListenerType = getListenerType(
		this._listener
	);

	protected readonly listenerArgumentsNames = getArgsNames(this._listener);

	constructor(
		private readonly _router: IRouter,
		private readonly _listener: Listener<T>,
		private readonly _socket: Socket,
		private readonly _log: Logger
	) {
		this.serializer = getListenerSerializer(_listener);
	}

	handle(): void {
		this._socket.on(this._listener.name, (...args: any[]) => {
			// what must be set up before the next socket event (see receivedCall)
			const received = this.receivedCall(args);

			// the call, and every stream it opens, runs in the socket's tenant
			const run = (ctx: TenantCtx) =>
				TenantContext.run(ctx, () => this.handleRequest(args, received));

			if (!hasSocketTenantInfo(this._socket)) {
				run(socketTenantCtx(this._socket));
				return;
			}

			// with the access the login and tenant give now: a socket whose
			// access was revoked is disconnected instead (tenant-socket.ts)
			recheckSocketAccess(this._socket).then(
				(ctx) => {
					if (ctx) {
						run(ctx);
					}
				},
				(err) => {
					// the check itself failed (e.g. the database is down): keep the
					// access of the connection; the next check applies any change
					this._log.warn(
						{ ...this.baseLogDetails, err },
						'socket access re-check failed'
					);
					run(socketTenantCtx(this._socket));
				}
			);
		});
	}

	abstract handleRequest(args: any[], received?: unknown): void;

	/**
	 * Runs as the call arrives, before the access re-check: the client may send
	 * follow-up events (an observable's `<callId>_subscribe`) right after the
	 * call, so their listeners are set up here. Its result goes to handleRequest.
	 */
	protected receivedCall(_args: any[]): unknown {
		return undefined;
	}

	/**
	 * Why the socket (its tenant and handshake login) may not call this
	 * listener, or null when it may. Default deny: see SOCKET_ACCESS.
	 */
	protected accessError(): Error | null {
		const key = socketAccessKey(this.routerName, this._listener.name);
		const access = SOCKET_ACCESS[key];
		const ctx = TenantContext.capture();

		if (isAllowed(access, ctx)) {
			return null;
		}

		if (access !== undefined && access !== 'platform' && ctx?.tenantId == null) {
			return new TenantContextMissingError(key);
		}

		if (access !== undefined && access !== 'public' && ctx?.actor == null) {
			return new SocketAccessError(`Log in to use ${key}`);
		}

		return new SocketAccessError(`Not allowed: ${key}`);
	}

	protected baseLogDetails = {
		socketId: this._socket.id,
		listenerName: this._listener.name,
		listenerType: this.listenerType,
		routerName: this.routerName,
	};

	protected logCall(callId: string, args: any[]) {
		this._log.info(
			{
				...this.baseLogDetails,
				callId,
				args: this.toLoggable(
					_.zipObject(this.listenerArgumentsNames, args)
				),
			},
			`Listener called`
		);
	}

	/**
	 * Masks secrets in a value before it is logged. Never throws, so a value
	 * that cannot be copied cannot break the call that is being logged.
	 */
	protected toLoggable(value: any): any {
		try {
			return maskPasswords(value);
		} catch (err) {
			return '[Unloggable]';
		}
	}

	protected serializeError(_error) {
		if (_error instanceof Error) {
			const error: Error = _error;

			return {
				__isError__: true,
				name: error.name,
				message: error.message,
			};
		} else {
			return _error;
		}
	}
}
