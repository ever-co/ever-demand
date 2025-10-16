import { ComponentType } from 'react';

/**
 *
 * @param _MyComponent
 * @returns
 */
export function getReactComponentProps<Props>(
	_MyComponent: ComponentType<Props>,
): Props {
	return {} as unknown as Props;
}

export function checkServer(
	url: string,
	timeout: number = 2000,
	onSuccessCallback: (msg?: string) => any = () => {},
	onErrorCallback: (msg?: string) => any = () => {},
	strick: boolean = false,
): Promise<void> {
	// eslint-disable-next-line no-undef
	const controller = new AbortController();
	const signal = controller.signal;
	const options = { mode: 'no-cors', signal };
	return fetch(url, options as any)
		.then(
			// @ts-ignore
			setTimeout(() => {
				controller.abort();
			}, timeout),
		)
		.then((res) => {
			if (
				strick &&
				!((res.status >= 200 && res.status < 300) || res.status === 304)
			) {
				console.log('🛑 Check server error:', res.status);
				return onErrorCallback(res.status.toString());
			}

			console.log('✅ Check server response:', res.status);
			onSuccessCallback(res.status.toString());
		})
		.catch((error) => {
			console.log('🛑 Check server error:', error);
			onErrorCallback(error.message);
		});
}

/**
 *
 * @param data
 * @returns
 */
export function isEmpty(data: any) {
	switch (typeof data) {
		case 'object':
			for (const prop in data) {
				if (data.hasOwnProperty(prop)) {
					return false;
				}
			}
			return JSON.stringify(data) === JSON.stringify({}) || data === null;

		case 'string':
			return !data && !data.trim().length && data != null;

		case 'number':
			return !data && !isNaN(data);

		case 'boolean':
			return !data;

		default:
			return true;
	}
}

/**
 *
 * @param {object} object Object that will be tested
 * @param {string[]} except fields that will be excepted
 * @description Function that will test Object items one by one & return an object of empty fields
 * @returns Array
 */
export function testObjectItem(
	object: { [key: string]: any },
	except: string[] = [],
) {
	if (typeof object !== 'object') {
		return console.warn('This function require a object');
	}

	const arrayKey = [];

	for (const key in object) {
		if (Object.hasOwnProperty.call(object, key)) {
			if (isEmpty(object[key]) && except.includes(key)) {
				arrayKey.push(key);
			}
		}
	}
	return arrayKey;
}

/**
 *
 * @param length
 * @returns
 */
export function plural(length: number) {
	if (length > 1) {
		return 's';
	} else {
		return '';
	}
}

/**
 *
 * @param date
 * @returns
 */
export function formatNativeDate(date = '') {
	const d = new Date(date);
	let month = '' + (d.getMonth() + 1);
	let day = '' + d.getDate();
	const year = d.getFullYear();

	if (month.length < 2) {
		month = '0' + month;
	}
	if (day.length < 2) {
		day = '0' + day;
	}

	return [year, month, day].join('-');
}
