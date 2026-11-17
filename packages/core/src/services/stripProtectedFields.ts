/**
 * Fields the generic socket update listeners (WarehousesService.save,
 * CarriersService.updateById and UsersService.updateUser) must never write.
 * Anyone who opens a socket to those routers can call them, so without this
 * a caller could set its own password hash and then log in, undo a ban or
 * restore a deleted account. Each field has its own server-side writer: the
 * hash is set by AuthService, the ban flag by banUser / unbanUser, the delete
 * flag by the removal methods and the timestamps by the database layer.
 */
const PROTECTED_FIELDS: ReadonlyArray<string> = [
	'hash',
	'isBanned',
	'isDeleted',
	'_createdAt',
	'_updatedAt',
];

function isProtectedKey(key: string): boolean {
	return (
		// Mongoose maps a dotted path such as `hash.0` or `hash.` to the
		// `hash` field, so a key is checked by its first path segment.
		PROTECTED_FIELDS.includes(key.split('.')[0]) ||
		// A MongoDB update operator such as `$set` or `$unset` could write a
		// protected field by another route.
		key.startsWith('$') ||
		// Assigning a `__proto__` key (JSON.parse keeps it as an own key)
		// would set the copy's prototype instead of copying a field.
		key === '__proto__'
	);
}

/**
 * Returns a shallow copy of `updateObject` without hash, isBanned, isDeleted,
 * _createdAt, _updatedAt, any dotted path into one of them (such as `hash.0`)
 * and any key starting with '$'. The input is not
 * changed. An array (a MongoDB update pipeline), null or any other non-object
 * gives an empty update.
 */
export function stripProtectedFields<T>(updateObject: T): Partial<T> {
	const copy: any = {};

	if (
		updateObject == null ||
		typeof updateObject !== 'object' ||
		Array.isArray(updateObject)
	) {
		return copy;
	}

	for (const key of Object.keys(updateObject)) {
		if (!isProtectedKey(key)) {
			copy[key] = updateObject[key];
		}
	}

	return copy;
}
