import Utils from '../../../../common/src/utils';

// GeoJSON order: [longitude, latitude]
const loc = (lng: number, lat: number) =>
	({ type: 'Point', coordinates: [lng, lat] } as any);

describe('Utils.getLocDistance', () => {
	it('is 0 for the same point', () => {
		expect(Utils.getLocDistance(loc(23.3219, 42.6977), loc(23.3219, 42.6977))).toBe(0);
	});

	it('treats coordinates as [lng, lat]: 1 degree of longitude at 60N is about 55.6 km', () => {
		// Before the fix longitudes were used as latitudes, giving ~111.2 km.
		const d = Utils.getLocDistance(loc(0, 60), loc(1, 60));

		expect(d).toBeGreaterThan(55);
		expect(d).toBeLessThan(56.2);
	});

	it('treats coordinates as [lng, lat]: 1 degree of latitude is about 111.2 km', () => {
		const d = Utils.getLocDistance(loc(10, 50), loc(10, 51));

		expect(d).toBeGreaterThan(111);
		expect(d).toBeLessThan(111.5);
	});

	it('returns a realistic distance between two cities (Sofia - Plovdiv, ~133 km)', () => {
		const d = Utils.getLocDistance(
			loc(23.3219, 42.6977),
			loc(24.7453, 42.1354)
		);

		expect(d).toBeGreaterThan(131);
		expect(d).toBeLessThan(134.5);
	});

	it('is symmetric', () => {
		const a = loc(23.3219, 42.6977);
		const b = loc(24.7453, 42.1354);

		expect(Utils.getLocDistance(a, b)).toBeCloseTo(
			Utils.getLocDistance(b, a),
			10
		);
	});

	it('reports short distances in km (0.0005 degrees of latitude is ~55 m)', () => {
		const d = Utils.getLocDistance(loc(23.3219, 42.6977), loc(23.3219, 42.6982));

		expect(d).toBeGreaterThan(0.05);
		expect(d).toBeLessThan(0.06);
	});
});

describe('Utils.calcCrow', () => {
	it('keeps its (lat, lng) argument order', () => {
		expect(Utils.calcCrow(60, 0, 60, 1)).toBeGreaterThan(55);
		expect(Utils.calcCrow(60, 0, 60, 1)).toBeLessThan(56.2);
	});
});
