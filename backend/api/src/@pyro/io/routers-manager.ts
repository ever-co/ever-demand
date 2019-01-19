import { createEverLogger } from '../../helpers/Log';
import { injectable, multiInject } from 'inversify';
import { IRouter, RouterSymbol } from './router/router';
import { RouterHandler } from './router/handler';

export interface IRoutersManager {
	startListening(io: SocketIO.Server);
}

@injectable()
export class RoutersManager implements IRoutersManager {
	constructor(@multiInject(RouterSymbol) protected routers: any[]) {}

	protected log = createEverLogger({ name: 'io' });

	protected io: SocketIO.Server;

	public startListening(io: SocketIO.Server) {
		this.io = io;

		this.routers.forEach((router) => {
			this.startRouterListening(router);
		});
	}

	private startRouterListening(router: IRouter) {
		try {
			const routerHandler = new RouterHandler(this.io, router, this.log);
			routerHandler.listen();
		} catch (err) {
			this.log.fatal("Couldn't start router listening!", { err });
		}
	}
}
