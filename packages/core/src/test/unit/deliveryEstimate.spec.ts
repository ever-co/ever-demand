import {
	DEFAULT_CARRIER_SPEED_KMH,
	MAX_DELIVERY_ESTIMATE_SECONDS,
	MIN_DELIVERY_ESTIMATE_SECONDS,
	estimateDeliverySeconds,
} from '../../helpers/deliveryEstimate';

describe('estimateDeliverySeconds', () => {
	it('grows with the distance', () => {
		const near = estimateDeliverySeconds(2);
		const far = estimateDeliverySeconds(10);

		expect(near).toBeGreaterThan(MIN_DELIVERY_ESTIMATE_SECONDS);
		expect(far).toBeGreaterThan(near);
		expect(Number.isInteger(near)).toBe(true);
		expect(Number.isInteger(far)).toBe(true);
	});

	it('takes about 30 minutes for 10 km at the default speed', () => {
		const seconds = estimateDeliverySeconds(10);

		// 10 km of straight line is about 13 km of road at 25 km/h
		expect(seconds).toBeGreaterThanOrEqual(1800);
		expect(seconds).toBeLessThanOrEqual(2000);
	});

	it('is shorter for a faster carrier', () => {
		expect(estimateDeliverySeconds(10, 50)).toBeLessThan(
			estimateDeliverySeconds(10, 25)
		);
	});

	it('never goes below the minimum, even at distance 0', () => {
		expect(estimateDeliverySeconds(0)).toBe(MIN_DELIVERY_ESTIMATE_SECONDS);
		expect(estimateDeliverySeconds(0.001)).toBe(
			MIN_DELIVERY_ESTIMATE_SECONDS
		);
	});

	it('never goes above the maximum', () => {
		expect(estimateDeliverySeconds(100000)).toBe(
			MAX_DELIVERY_ESTIMATE_SECONDS
		);
		expect(estimateDeliverySeconds(Number.MAX_VALUE)).toBe(
			MAX_DELIVERY_ESTIMATE_SECONDS
		);
	});

	it.each([[NaN], [Infinity], [-Infinity], [-1], [undefined], [null]])(
		'gives no estimate (0) for the distance %p',
		(distance) => {
			expect(estimateDeliverySeconds(distance as any)).toBe(0);
		}
	);

	it.each([[0], [-5], [NaN], [Infinity], [null]])(
		'falls back to the default speed for the speed %p',
		(speed) => {
			expect(estimateDeliverySeconds(10, speed as any)).toBe(
				estimateDeliverySeconds(10, DEFAULT_CARRIER_SPEED_KMH)
			);
		}
	);
});
