import { createEverLogger } from '../../helpers/Log';
import { injectable, multiInject } from 'inversify';
import { IRouter, RouterSymbol } from './router/router';
import { RouterHandler } from './router/handler';
import Logger from 'bunyan';
import { Server } from 'socket.io';

export interface IRoutersManager {
	startListening(io: Server);
}

@injectable()
export class RoutersManager implements IRoutersManager {
	constructor(@multiInject(RouterSymbol) protected routers: any[]) {}

	protected log: Logger = createEverLogger({ name: 'io' });

	protected io: Server;

	async startListening(io: Server) {
		this.io = io;

		this.routers.forEach(async (router) => {
			await this.startRouterListening(router);
		});
	}

	private async startRouterListening(router: IRouter) {
		try {
			const routerHandler = new RouterHandler(this.io, router, this.log);
			await routerHandler.listen();
		} catch (err) {
			this.log.fatal("Couldn't start router listening!", { err });
		}
	}
}
