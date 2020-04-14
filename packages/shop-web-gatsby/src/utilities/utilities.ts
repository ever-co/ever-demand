import { getlocale } from '../auth';

export const matchLocale = (arr) =>
	arr.filter((item) => item.locale === getlocale()).value || arr[0].value;
