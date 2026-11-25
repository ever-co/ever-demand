import { getlocale } from '../auth/auth';

export interface LocaleValue {
	locale?: string | null;
	value?: string | null;
}

/**
 * The value of a translated field (product title, description...) in the chosen locale,
 * else in the first locale it has. Locales compare case-insensitively ('en-us' = 'en-US').
 */
export const matchLocale = (
	values: readonly LocaleValue[] | null | undefined,
	locale: string = getlocale(),
): string => {
	if (!values || values.length === 0) {
		return '';
	}
	const wanted = locale.toLowerCase();
	const match = values.find((item) => item.locale?.toLowerCase() === wanted);
	return (match ?? values[0]).value ?? '';
};

/** Locales of the product texts (the settings page offers them). */
export const LOCALES = ['en-US', 'fr-FR', 'bg-BG', 'he-IL', 'es-ES', 'ru-RU'];
