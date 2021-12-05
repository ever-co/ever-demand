import { IListenerHandler } from './handler';
import { getRouterName, IRouter } from '../../router/router';
import Logger from 'bunyan';
import { getListenerType, Listener } from '../listener';
import { ListenerType } from '../types';
import { getListenerSerializer } from '../serialization';
import * as _ from 'lodash';
import getArgsNames from '@captemulation/get-parameter-names';
import { Socket } from 'socket.io';

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
			this.handleRequest(args);
		});
	}

	abstract handleRequest(args: any[]): void;

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
				args: _.zipObject(this.listenerArgumentsNames, args),
			},
			`Listener called`
		);
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
