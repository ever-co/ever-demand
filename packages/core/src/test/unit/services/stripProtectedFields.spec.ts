import { stripProtectedFields } from '../../../services/stripProtectedFields';

describe('stripProtectedFields', () => {
	it('drops hash, isBanned, isDeleted, the timestamps and $ keys', () => {
		expect(
			stripProtectedFields({
				firstName: 'New',
				hash: 'h',
				isBanned: false,
				isDeleted: false,
				_createdAt: '2020-01-01T00:00:00.000Z',
				_updatedAt: '2020-01-01T00:00:00.000Z',
				$set: { hash: 'h' },
				$unset: { isBanned: 1 },
			} as any)
		).toEqual({ firstName: 'New' });
	});

	it('returns a copy and leaves the input as it was', () => {
		const input = { firstName: 'New', hash: 'h' };

		const result = stripProtectedFields(input);

		expect(result).not.toBe(input);
		expect(input).toEqual({ firstName: 'New', hash: 'h' });
	});

	it('does not take a __proto__ key from parsed JSON as the prototype', () => {
		const input = JSON.parse(
			'{"firstName":"New","__proto__":{"hash":"h","isBanned":false}}'
		);

		const result: any = stripProtectedFields(input);

		expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
		expect(result.hash).toBeUndefined();
		expect(result.isBanned).toBeUndefined();
		expect(result).toEqual({ firstName: 'New' });
	});

	it('writes nothing for an update pipeline, null or a non-object', () => {
		expect(stripProtectedFields([{ $set: { hash: 'h' } }] as any)).toEqual(
			{}
		);
		expect(stripProtectedFields(null)).toEqual({});
		expect(stripProtectedFields(undefined)).toEqual({});
		expect(stripProtectedFields('hash' as any)).toEqual({});
	});
});
