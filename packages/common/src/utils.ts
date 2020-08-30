import GeoLocation from './entities/GeoLocation';
import { ILocation } from './interfaces/IGeoLocation';
import { sample } from 'lodash';
import Order from './entities/Order';

namespace Utils {
	/**
	 * This function takes in latitude and longitude of two location and returns the distance
	 * between them as the crow flies (in km)
	 * You are not meant to understand this... :)
	 * See https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates-shows-wrong
	 *
	 * @export
	 * @param {number} lat1
	 * @param {number} lon1
	 * @param {number} lat2
	 * @param {number} lon2
	 * @returns {number}
	 */
	export function calcCrow(
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number
	): number {
		const R: number = 6371; // km
		const dLat: number = Utils._toRad(lat2 - lat1);
		const dLon: number = Utils._toRad(lon2 - lon1);

		lat1 = Utils._toRad(lat1);
		lat2 = Utils._toRad(lat2);

		const a =
			Math.pow(Math.sin(dLat / 2), 2) +
			Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		const d = R * c;

		return d;
	}

	// tslint:disable-next-line:no-shadowed-variable
	export function getDistance(
		geoLocation1: GeoLocation,
		geoLocation2: GeoLocation
	): number {
		return getLocDistance(geoLocation1.loc, geoLocation2.loc);
	}

	export function getLocDistance(loc1: ILocation, loc2: ILocation): number {
		return calcCrow(
			loc1.coordinates[0],
			loc1.coordinates[1],
			loc2.coordinates[0],
			loc2.coordinates[1]
		);
	}

	/**
	 * Converts numeric degrees to radians
	 *
	 * @export
	 * @param {number} v
	 * @returns {number}
	 */
	export function _toRad(v: number): number {
		return (v * Math.PI) / 180;
	}

	/**
	 * Returns a random integer between min (included) and max (excluded)
	 * Using Math.round() will give you a non-uniform distribution!
	 *
	 * @export
	 * @param {*} min
	 * @param {*} max
	 * @returns {number}
	 */
	export function getRandomInt(min, max): number {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	// tslint:disable-next-line:no-shadowed-variable
	export function toDate(date: string | Date) {
		if (date instanceof Date) {
			return date;
		} else {
			return new Date(date);
		}
	}

	export function generatedLogoColor() {
		return sample(['#269aff', '#ffaf26', '#8b72ff', '#0ecc9D']).replace(
			'#',
			''
		);
	}
}

export const getDistance = Utils.getDistance;
export const toDate = Utils.toDate;
export const getDummyImage = (
	width: number,
	height: number,
	letter: string
) => {
	return `https://dummyimage.com/${width}x${height}/${Utils.generatedLogoColor()}/ffffff.jpg&text=${letter}`;
};

export const getPlaceholditImgix = (
	width: number,
	height: number,
	fontSize: number,
	name: string
) => {
	return `https://placeholdit.imgix.net/~text?txtsize=${fontSize}&txt=${name}&w=${width}&h=${height}`;
};

export const getFakeImg = (
	width: number,
	height: number,
	fontSize: number,
	name: string
) => {
	return `https://fakeimg.pl/${width}x${height}/FFD890%2C128/000/?text=${name}&font_size=${fontSize}`;
};

export const generateObjectIdString = (
	m = Math,
	d = Date,
	h = 16,
	s = (x) => m.floor(x).toString(h)
) => {
	return (
		s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))
	);
};

export function getIdFromTheDate(order: Order): string {
	if (!order['createdAt'] || !order.orderNumber) {
		throw `Can't use getIdFromTheDate function. Property ${
			!order['createdAt'] ? 'createdAt' : 'orderNumber'
		} is missing!`;
	}
	const [day, month, year] = new Date(order['createdAt'])
		.toLocaleDateString()
		.split('/');

	let d = ('0' + day).slice(-2);
	d = d.substr(-2);
	let m = ('0' + month).slice(-2);
	m = m.substr(-2);

	return `${d}${m}${year}-${order.orderNumber}`;
}

export default Utils;
