export class IconAlreadyRegisteredError extends Error {
	constructor() {
		super('Icon was already registered!');
		Object.setPrototypeOf(this, IconAlreadyRegisteredError.prototype);
	}
}
