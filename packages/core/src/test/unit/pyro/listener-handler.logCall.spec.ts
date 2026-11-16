import 'reflect-metadata';
import {
	BaseListenerHandler,
	maskPasswords,
} from '../../../@pyro/io/listener/handler/base';

class TestRouter {}

class TestHandler extends BaseListenerHandler<any> {
	handleRequest(_args: any[]): void {
		return;
	}

	call(callId: string, args: any[]) {
		this.logCall(callId, args);
	}
}

describe('BaseListenerHandler.logCall', () => {
	const build = (listener: (...a: any[]) => any) => {
		const log = { info: jest.fn(), error: jest.fn() };
		const handler = new TestHandler(
			new TestRouter() as any,
			listener as any,
			{ id: 'socket1', on: jest.fn() } as any,
			log as any
		);

		return { log, handler };
	};

	it('never logs a plaintext password argument', () => {
		const { log, handler } = build(function updatePassword(
			id: string,
			password: any
		) {
			return;
		});

		handler.call('c1', ['user1', { current: 'oldSecret1', new: 'newSecret2' }]);

		const logged = JSON.stringify(log.info.mock.calls);

		expect(logged).toContain('user1');
		expect(logged).not.toContain('oldSecret1');
		expect(logged).not.toContain('newSecret2');
	});

	it('never logs a nested input.password', () => {
		const { log, handler } = build(function register(input: any) {
			return;
		});

		handler.call('c2', [
			{ user: { email: 'a@b.c' }, password: 'hunter2hunter2' },
		]);

		const logged = JSON.stringify(log.info.mock.calls);

		expect(logged).toContain('a@b.c');
		expect(logged).not.toContain('hunter2hunter2');
	});
});

describe('maskPasswords', () => {
	it('masks password at any depth, including inside arrays', () => {
		const input = {
			a: { password: 'p1', keep: 1 },
			list: [{ password: { current: 'p2' } }, 'p3'],
		};

		expect(maskPasswords(input)).toEqual({
			a: { password: '***', keep: 1 },
			list: [{ password: '***' }, 'p3'],
		});
	});

	it('does not mutate its input', () => {
		const input = { password: 'p1' };

		maskPasswords(input);

		expect(input.password).toBe('p1');
	});

	it('does not overflow the stack on very deep input', () => {
		const root: any = {};
		let node = root;
		for (let i = 0; i < 100000; i++) {
			node.next = {};
			node = node.next;
		}

		expect(() => maskPasswords(root)).not.toThrow();
		expect(JSON.stringify(maskPasswords(root))).toContain('[Truncated]');
	});

	it('still masks passwords at moderate depth', () => {
		const input = { a: { b: { c: { password: 'deepSecret' } } } };

		expect(maskPasswords(input).a.b.c.password).toBe('***');
	});

	it('leaves other values untouched and survives cycles', () => {
		const date = new Date(0);
		const cyclic: any = { when: date, n: 1, s: 'x', nil: null };
		cyclic.self = cyclic;

		const result = maskPasswords(cyclic);

		expect(result.when).toBe(date);
		expect(result).toMatchObject({ n: 1, s: 'x', nil: null });
		expect(result.self).toBeDefined();
	});
});
