import 'reflect-metadata';

// The real `@pyro/io` decorators and router wiring run here, so the router
// metadata and namespaces are exactly what the socket server uses. Only the
// logger is stubbed, so the test can read what was logged.
const mockLog = {
	info: jest.fn(),
	error: jest.fn(),
	fatal: jest.fn(),
};

jest.mock('../../../helpers/Log', () => ({
	createEverLogger: () => mockLog,
}));

import { asyncListener, routerName, RoutersManager } from '../../../@pyro/io';
import { RouterHandler } from '../../../@pyro/io/router/handler';

@routerName('named')
class NamedRouter {
	@asyncListener()
	async ping(): Promise<string> {
		return 'pong';
	}
}

// Like AdminsService on develop: socket listeners, but no @routerName.
class UnnamedRouter {
	@asyncListener()
	async updateById(_id: string, _update: any): Promise<void> {
		return;
	}
}

function fakeIo() {
	const namespace = { on: jest.fn(), use: jest.fn() };
	const io = { of: jest.fn(() => namespace) };

	return { io, namespace };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe('RoutersManager with a router that has no @routerName', () => {
	beforeEach(() => {
		mockLog.info.mockReset();
		mockLog.error.mockReset();
		mockLog.fatal.mockReset();
	});

	it("does not open the '/undefined' namespace", async () => {
		const { io } = fakeIo();
		const manager = new RoutersManager([
			new NamedRouter(),
			new UnnamedRouter(),
		]);

		await manager.startListening(io as any);
		await flush();

		const namespaces = io.of.mock.calls.map((call: any[]) => call[0]);

		expect(namespaces).not.toContain('/undefined');
		expect(namespaces).toEqual(['/named']);
	});

	it('logs an error that names the router', async () => {
		const { io } = fakeIo();
		const manager = new RoutersManager([new UnnamedRouter()]);

		await manager.startListening(io as any);
		await flush();

		expect(io.of).not.toHaveBeenCalled();
		expect(mockLog.error).toHaveBeenCalledTimes(1);
		expect(JSON.stringify(mockLog.error.mock.calls[0])).toContain(
			'UnnamedRouter'
		);
	});

	it('still serves a named router on its own namespace', async () => {
		const { io, namespace } = fakeIo();
		const manager = new RoutersManager([new NamedRouter()]);

		await manager.startListening(io as any);
		await flush();

		expect(io.of).toHaveBeenCalledWith('/named');
		// every connection resolves its tenant first (tenant/tenant-socket.ts)
		expect(namespace.use).toHaveBeenCalledWith(expect.any(Function));
		expect(namespace.on).toHaveBeenCalledWith(
			'connection',
			expect.any(Function)
		);
		expect(mockLog.error).not.toHaveBeenCalled();
	});
});

describe('RouterHandler.listen with a router that has no @routerName', () => {
	it('opens no namespace and logs an error', async () => {
		const { io } = fakeIo();
		const log = { info: jest.fn(), error: jest.fn() };

		await new RouterHandler(
			io as any,
			new UnnamedRouter(),
			log as any
		).listen();

		expect(io.of).not.toHaveBeenCalled();
		expect(log.error).toHaveBeenCalledTimes(1);
	});
});
