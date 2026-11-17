import { getListeners, getRouterName, IRouter } from './router';
import { ConnectionHandler } from '../connection-handler';
import { Listener } from '../listener/listener';
import Logger from 'bunyan';
import { Server, Namespace } from 'socket.io';

export class RouterHandler {
	private readonly routerName: string;

	private readonly listeners: Array<Listener<any>>;

	constructor(
		private readonly io: Server,
		private readonly router: IRouter,
		private readonly log: Logger
	) {
		this.routerName = getRouterName(router);
		this.listeners = getListeners(router);
	}

	async listen(): Promise<void> {
		if (typeof this.routerName !== 'string' || this.routerName === '') {
			// Without @routerName the namespace would be '/undefined': no client
			// uses it and nothing guards it, so its listeners stay closed.
			this.log.error(
				{
					router: this.router.constructor.name,
					listeners: this.listeners
						? this.listeners.map((listener) => listener.name)
						: null,
				},
				'Router has no @routerName, so its socket namespace is not opened'
			);
			return;
		}

		this.log.info(`Starting router listening`, {
			routerName: this.routerName,
			listeners: this.listeners
				? this.listeners.map((listener) => listener.name)
				: null,
		});

		const routerNamespace: Namespace = this.io.of(
			`/${this.routerName}`
		);

		// TODO: figure out why we needed below
		// routerNamespace.setMaxListeners(0);

		routerNamespace.on('connection', (socket) => {
			const connectionHandler = new ConnectionHandler(
				socket,
				this.router,
				this.log
			);
			connectionHandler.handle();
		});
	}
}
