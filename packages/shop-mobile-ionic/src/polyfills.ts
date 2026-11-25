/**
 * Polyfills loaded before the app (after zone.js, see angular.json "polyfills").
 */

// Some dependencies still look for Node's `process` and `global`.
(window as any).process = (window as any).process || {
	env: { DEBUG: undefined },
};
(window as any).global = window;

// The shared entities (packages/common) use @pyro/db decorators that call
// Reflect.defineMetadata / Reflect.getMetadata when their classes load.
import 'reflect-metadata';
