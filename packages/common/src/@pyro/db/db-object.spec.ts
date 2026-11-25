import { assignRaw } from './db-object';

class Base {
	_id = 'abc';
	get id(): string {
		return this._id;
	}
}

class Entity extends Base {
	name: string;
	private _nick = '';
	get nick(): string {
		return this._nick;
	}
	set nick(value: string) {
		this._nick = value.trim();
	}
	get label(): string {
		return `${this.name} (${this.id})`;
	}
}

describe('assignRaw', () => {
	it('copies plain fields like _.assign', () => {
		const target = assignRaw(new Entity(), { _id: 'x1', name: 'Pizza' });

		expect(target._id).toBe('x1');
		expect(target.name).toBe('Pizza');
	});

	it('skips getter-only accessors instead of throwing in strict mode', () => {
		const target = new Entity();

		expect(() =>
			assignRaw(target, { _id: 'x2', id: 'ignored', label: 'ignored', name: 'Pasta' })
		).not.toThrow();
		expect(target.id).toBe('x2');
		expect(target.label).toBe('Pasta (x2)');
	});

	it('still goes through setters', () => {
		const target = assignRaw(new Entity(), { nick: '  chef  ' });

		expect(target.nick).toBe('chef');
	});

	it('returns the target', () => {
		const target = new Entity();

		expect(assignRaw(target, {})).toBe(target);
	});
});
