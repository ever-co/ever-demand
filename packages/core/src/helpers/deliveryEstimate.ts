/**
 * Average speed of a carrier on the way to a customer, in km/h. A rough city
 * figure: the estimate only has to be good enough to tell a customer
 * "about 20 minutes", not to route a vehicle.
 */
export const DEFAULT_CARRIER_SPEED_KMH = 25;

/**
 * The distance between two points as the crow flies is shorter than any road
 * between them. The estimate multiplies it by this factor to allow for turns.
 */
export const ROAD_DETOUR_FACTOR = 1.3;

/** Lower bound of an estimate, in seconds: a started delivery is never "0 s". */
export const MIN_DELIVERY_ESTIMATE_SECONDS = 60;

/** Upper bound of an estimate, in seconds (24 hours). */
export const MAX_DELIVERY_ESTIMATE_SECONDS = 24 * 60 * 60;

/**
 * Seconds a carrier needs to cover `distanceKm` (the straight-line distance
 * between the carrier and the customer), for `Order.deliveryTimeEstimate`.
 *
 * Returns 0, "no estimate", when the distance is not a finite number or is
 * negative. Otherwise the result is a whole number of seconds between
 * `MIN_DELIVERY_ESTIMATE_SECONDS` and `MAX_DELIVERY_ESTIMATE_SECONDS`. A speed
 * that is not a positive finite number is replaced by the default speed.
 */
export function estimateDeliverySeconds(
	distanceKm: number,
	speedKmh: number = DEFAULT_CARRIER_SPEED_KMH
): number {
	if (
		typeof distanceKm !== 'number' ||
		!Number.isFinite(distanceKm) ||
		distanceKm < 0
	) {
		return 0;
	}

	const speed =
		typeof speedKmh === 'number' &&
		Number.isFinite(speedKmh) &&
		speedKmh > 0
			? speedKmh
			: DEFAULT_CARRIER_SPEED_KMH;

	const seconds = Math.ceil(
		(distanceKm * ROAD_DETOUR_FACTOR * 60 * 60) / speed
	);

	return Math.min(
		MAX_DELIVERY_ESTIMATE_SECONDS,
		Math.max(MIN_DELIVERY_ESTIMATE_SECONDS, seconds)
	);
}
