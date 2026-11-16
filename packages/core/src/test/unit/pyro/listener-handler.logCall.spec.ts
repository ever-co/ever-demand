import 'reflect-metadata';
import mongoose from 'mongoose';
import { Subject } from 'rxjs';
import {
	BaseListenerHandler,
	maskPasswords,
} from '../../../@pyro/io/listener/handler/base';
import { AsyncListenerHandler } from '../../../@pyro/io/listener/handler/async';
import { ObservableListenerHandler } from '../../../@pyro/io/listener/handler/observable';

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6InUxIn0.c2lnbmF0dXJl';

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

		handler.call('c1', [
			'user1',
			{ current: 'oldSecret1', new: 'newSecret2' },
		]);

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

	it('never logs a token argument', () => {
		const { log, handler } = build(function isAuthenticated(token: string) {
			return;
		});

		handler.call('c3', [TOKEN]);

		expect(JSON.stringify(log.info.mock.calls)).not.toContain(TOKEN);
	});

	it('logs an ObjectId argument as its hex string', () => {
		const id = new mongoose.Types.ObjectId();
		const { log, handler } = build(function save(warehouse: any) {
			return;
		});

		handler.call('c4', [{ _id: id, name: 'w' }]);

		expect(log.info.mock.calls[0][0].args).toEqual({
			warehouse: { _id: id.toHexString(), name: 'w' },
		});
	});
});

describe('AsyncListenerHandler result log', () => {
	it('never logs the login token, but still returns it', async () => {
		const log = { info: jest.fn(), error: jest.fn() };

		async function login(email: string, password: string) {
			return { user: { email }, token: TOKEN };
		}

		const handler = new AsyncListenerHandler(
			new TestRouter() as any,
			login as any,
			{ id: 'socket1', on: jest.fn() } as any,
			log as any
		);

		const callback = jest.fn();

		await handler.handleRequest(['a@b.c', 'hunter2hunter2', callback]);

		const logged = JSON.stringify(log.info.mock.calls);

		expect(logged).toContain('a@b.c');
		expect(logged).not.toContain(TOKEN);
		expect(logged).not.toContain('hunter2hunter2');
		expect(callback).toHaveBeenCalledWith(null, {
			user: { email: 'a@b.c' },
			token: TOKEN,
		});
	});

	it('still completes the call when a result cannot be copied', async () => {
		const log = { info: jest.fn(), error: jest.fn() };
		class Unserializable {
			toJSON() {
				throw new Error('no json');
			}
		}

		const result = new Unserializable();

		async function get() {
			return result;
		}

		const handler = new AsyncListenerHandler(
			new TestRouter() as any,
			get as any,
			{ id: 'socket1', on: jest.fn() } as any,
			log as any
		);

		const callback = jest.fn();

		await handler.handleRequest([callback]);

		expect(log.error).not.toHaveBeenCalled();
		expect(callback).toHaveBeenCalledWith(null, result);
	});
});

describe('ObservableListenerHandler next-value log', () => {
	it('never logs a hash or token, but still emits them', () => {
		const log = { info: jest.fn(), error: jest.fn() };
		const subject = new Subject<any>();
		const handlers: { [event: string]: (...a: any[]) => void } = {};
		const socket = {
			id: 'socket1',
			on: (event: string, fn: (...a: any[]) => void) =>
				(handlers[event] = fn),
			emit: jest.fn(),
		};

		function get(id: string) {
			return subject.asObservable();
		}

		const handler = new ObservableListenerHandler(
			new TestRouter() as any,
			get as any,
			socket as any,
			log as any
		);

		handler.handleRequest(['id1', 'call1']);
		handlers.call1_subscribe('sub1');

		const value = { id: 'id1', hash: 'bcryptHash123', token: TOKEN };
		subject.next(value);

		const logged = JSON.stringify(log.info.mock.calls);

		expect(logged).toContain('id1');
		expect(logged).not.toContain('bcryptHash123');
		expect(logged).not.toContain(TOKEN);
		expect(socket.emit).toHaveBeenCalledWith('sub1_next', value);
	});
});

describe('maskPasswords', () => {
	it('masks hash, token-like, secret and password-like keys', () => {
		expect(
			maskPasswords({
				hash: 'h',
				token: 't',
				accessToken: 'a',
				clientSecret: 's',
				currentPassword: 'c',
				Password: 'P',
				email: 'e',
			})
		).toEqual({
			hash: '***',
			token: '***',
			accessToken: '***',
			clientSecret: '***',
			currentPassword: '***',
			Password: '***',
			email: 'e',
		});
	});

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
