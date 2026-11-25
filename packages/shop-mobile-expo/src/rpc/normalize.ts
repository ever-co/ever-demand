/**
 * The server sends pyro entities as JSON, so their prototype getters are lost: there is `_id` but
 * no `id`, `_createdAt` but no `createdAt`. The Angular client rebuilt entity classes; this adds the
 * two getters' values to every nested plain object instead.
 */
export function normalizeEntity<T>(value: T, depth = 0): T {
	if (value === null || typeof value !== 'object' || depth > 25) {
		return value;
	}
	if (Array.isArray(value)) {
		for (let i = 0; i < value.length; i++) {
			value[i] = normalizeEntity(value[i], depth + 1);
		}
		return value;
	}
	const record = value as Record<string, unknown>;
	if (record._id != null && record.id == null) {
		record.id = String(record._id);
	}
	if (record._createdAt != null && record.createdAt == null) {
		record.createdAt = record._createdAt;
	}
	if (record._updatedAt != null && record.updatedAt == null) {
		record.updatedAt = record._updatedAt;
	}
	for (const key of Object.keys(record)) {
		const child = record[key];
		if (child !== null && typeof child === 'object') {
			record[key] = normalizeEntity(child, depth + 1);
		}
	}
	return value;
}
