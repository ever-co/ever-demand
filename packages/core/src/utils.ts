// TODO: move all utils into shared/core

import { Observable } from 'rxjs';
import fs from 'fs';

export function observeFile(fileName: string): Observable<string> {
	return Observable.create((observer) => {
		const fetchTranslations = () => {
			fs.readFile(fileName, 'utf-8', (err, content) => {
				observer.next(content);

				if (err) {
					observer.error(err);
				}
			});
		};

		fetchTranslations();

		fs.watchFile(fileName, fetchTranslations);

		return () => {
			fs.unwatchFile(fileName, fetchTranslations);
		};
	});
}

/**
 * gee
 * @param {[number, number]} point - around which point
 * @param {number} radius - in meters
 * @returns {[number]}
 */
export function randomCoordinatesNear(
	[longitude, latitude]: [number, number],
	radius: number
): [number, number] {
	const r = 100 / 111300; // = 100 meters
	const y0 = longitude;
	const x0 = latitude;
	const u = Math.random();
	const v = Math.random();
	const w = r * Math.sqrt(u);
	const t = 2 * Math.PI * v;
	const x = w * Math.cos(t);
	const y1 = w * Math.sin(t);
	const x1 = x / Math.cos(y0);

	return [y0 + y1, x0 + x1];
}
