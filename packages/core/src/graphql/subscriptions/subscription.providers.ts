import { createServer } from 'http';

import { SUBSCRIPTION_SERVER } from './subscription.constants';

export const createSubscriptionProviders = (port: number = 5050) => [
	{
		provide: SUBSCRIPTION_SERVER,

		useFactory: () => {
			const server = createServer();

			const closeServer = () => {
				try {
					if (server != null) {
						server.close(() => {
							process.exit(0);
						});
					}
				} catch (err) {
					process.exit(0);
				}
			};

			process
				.on('SIGINT', () => closeServer())
				.on('SIGTERM', () => closeServer());

			return new Promise((resolve) =>
				server.listen(port, () => resolve(server))
			);
		},
	},
];
