export function isEmpty(data: any) {
	switch (typeof data) {
		case "object":
			for (var prop in data) {
				if (data.hasOwnProperty(prop)) {
					return false;
				}
			}
			return JSON.stringify(data) === JSON.stringify({}) || data === null;

		case "string":
			return !!!data && !!!data.trim().length && data != null;

		case "number":
			return !!!data && !(data != NaN);

		case "boolean":
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
	except: string[] = []
) {
	if (typeof object != "object")
		return console.warn("This function require a object");

	let arrayKey = [];

	for (const key in object) {
		if (Object.hasOwnProperty.call(object, key)) {
			if (isEmpty(object[key]) && except.includes(key)) arrayKey.push(key);
		}
	}
	return arrayKey;
}

export function plural(length: number) {
	if (length > 1) return "s";
	else return "";
}

export function formatNativeDate(date = "") {
	var d = new Date(date),
		month = "" + (d.getMonth() + 1),
		day = "" + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = "0" + month;
	if (day.length < 2) day = "0" + day;

	return [year, month, day].join("-");
}
