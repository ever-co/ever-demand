export class StorageService {
	/* /**\
	 * Allows us to associate class property with storage property,
	 * So they would refer to the same object on get or set of it.
	 * @param storageKey
	 * @returns PropertyDecorator
	 * @constructor
	 */
	/*public Store(storageKey: string): PropertyDecorator {
		function StorageDecorator(target, prop: string) {

			Object.defineProperty(target, prop, {
				get: () => {
					return this[storageKey];
				},
				set: (v) => {
					this[storageKey] = v;
				},
				enumerable: true,
				configurable: true
			});

		}

		return StorageDecorator;
	}*/
}
