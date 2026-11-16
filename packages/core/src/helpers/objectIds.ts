const objectIdHexPattern = /^[0-9a-fA-F]{24}$/;

/**
 * True only for an ObjectId written as 24 hex characters, the form order ids
 * take in the API. `ObjectId.isValid()` is not enough on its own: it also
 * accepts any 12-character string, which `new ObjectId()` reads as 12 raw
 * bytes.
 */
export function isObjectIdHexString(value: unknown): value is string {
	return typeof value === 'string' && objectIdHexPattern.test(value);
}

/**
 * Throws unless `orderIds` is a list of 24-character hex ObjectIds. The error
 * names the first bad id.
 */
export function throwIfInvalidOrderIds(orderIds: unknown): void {
	if (!Array.isArray(orderIds)) {
		throw new Error(
			'Order ids must be a list of 24-character hex ObjectId strings'
		);
	}

	for (const id of orderIds) {
		if (!isObjectIdHexString(id)) {
			const shown = String(id);

			throw new Error(
				`Invalid order id '${shown}': expected a 24-character hex ObjectId string`
			);
		}
	}
}

/**
 * Throws when a carrier create or update object sets `skippedOrderIds` to
 * anything but a list of 24-character hex ObjectIds. Leaving the field out
 * is fine.
 */
export function throwIfInvalidSkippedOrderIds(
	carrierInput: { skippedOrderIds?: unknown } | null | undefined
): void {
	if (carrierInput && carrierInput.skippedOrderIds != null) {
		throwIfInvalidOrderIds(carrierInput.skippedOrderIds);
	}
}
