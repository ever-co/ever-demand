// Only `sample` is used by utils (for random logo colors); avoid resolving the real module.
jest.mock('underscore', () => ({ sample: (arr: any[]) => arr[0] }), {
	virtual: true,
});

import Utils from '../../../../common/src/utils';
import { ILocation } from '../../../../common/src/interfaces/IGeoLocation';

describe('Utils.getLocDistance', () => {
	// GeoJSON / MongoDB order is [longitude, latitude].
	const point = (lng: number, lat: number): ILocation => ({
		type: 'Point' as const,
		coordinates: [lng, lat],
	});

	it('treats coordinates as [lng, lat] (km between two points 10 degrees of longitude apart at 60N)', () => {
		// 10 degrees of longitude at latitude 60 is about 555 km.
		// With lat/lng swapped it would be about 1111 km (10 degrees of latitude).
		const km = Utils.getLocDistance(point(10, 60), point(20, 60));

		expect(km).toBeGreaterThan(554);
		expect(km).toBeLessThan(557);
	});

	it('returns 0 for identical points', () => {
		expect(Utils.getLocDistance(point(34.78, 32.08), point(34.78, 32.08))).toBe(0);
	});

	it('is symmetric', () => {
		const a = point(34.78, 32.08);
		const b = point(35.21, 31.77);

		expect(Utils.getLocDistance(a, b)).toBeCloseTo(
			Utils.getLocDistance(b, a),
			6
		);
	});
});
