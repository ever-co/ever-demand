import type { Coordinates, GeoLocation } from '../domain/types';

export type MapPointKind = 'customer' | 'store' | 'carrier';

export interface MapPoint {
	kind: MapPointKind;
	coords: Coordinates;
}

export interface OrderMapProps {
	points: MapPoint[];
	/** Draw the way between the first two points (carrier → customer, customer → store). */
	route?: boolean;
	height?: number;
}

export function geoToCoords(geo: GeoLocation | null | undefined): Coordinates | null {
	const coordinates = geo?.loc?.coordinates;
	if (!coordinates || coordinates.length !== 2) {
		return null;
	}
	return { longitude: coordinates[0], latitude: coordinates[1] };
}

export function mapPoints(entries: Array<[MapPointKind, Coordinates | null]>): MapPoint[] {
	return entries
		.filter((entry): entry is [MapPointKind, Coordinates] => entry[1] != null)
		.map(([kind, coords]) => ({ kind, coords }));
}

/** OpenStreetMap directions between two points (web, and "open in maps"). */
export function directionsUrl(from: Coordinates, to: Coordinates): string {
	return (
		'https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=' +
		`${from.latitude}%2C${from.longitude}%3B${to.latitude}%2C${to.longitude}`
	);
}

export function pointUrl(point: Coordinates): string {
	return `https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=16/${point.latitude}/${point.longitude}`;
}
