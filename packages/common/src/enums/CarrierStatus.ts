/**
 * Current Carrier status
 * This status is set by carrier itself in his mobile app to indicate if he working now or can't work now
 *
 * @enum {number}
 */
enum CarrierStatus {
	/**
	 * Carrier online and ready to accept new jobs or already processing them
	 * (check orders collection for carrier to know what jobs he processing if any)
	 */
	Online = 0,

	/**
	 * Carrier offline and did not accept jobs right now (not working at the moment, e.g. sleep)
	 */
	Offline = 1,

	/**
	 * Carrier is blocked (temporary or permanently from work), e.g. banned from our platform
	 */
	Blocked = 2,
}

export default CarrierStatus;
