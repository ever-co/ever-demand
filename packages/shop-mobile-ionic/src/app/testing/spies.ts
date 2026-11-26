import { vi, type Mock } from 'vitest';

/**
 * A spy object like Jasmine's `createSpyObj`, built from Vitest mocks, so the specs that
 * came from Karma keep their shape: every listed method is a `vi.fn()`.
 */
export type SpyObj<T> = T & {
	[K in keyof T]: T[K] extends (...args: any[]) => any
		? T[K] & Mock<T[K]>
		: T[K];
};

/**
 * @param methods method names, or `{ name: returnValue }` to give each mock a return value
 * @param properties plain properties to put on the object
 */
export function createSpyObj<T = any>(
	_baseName: string,
	methods: readonly string[] | Record<string, unknown>,
	properties: Record<string, unknown> = {},
): SpyObj<T> {
	const spy: Record<string, unknown> = { ...properties };

	if (Array.isArray(methods)) {
		for (const name of methods) {
			spy[name] = vi.fn();
		}
	} else {
		for (const [name, value] of Object.entries(methods)) {
			spy[name] = vi.fn().mockReturnValue(value);
		}
	}

	return spy as SpyObj<T>;
}
