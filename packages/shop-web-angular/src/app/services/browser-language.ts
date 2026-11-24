import { TranslateService } from '@ngx-translate/core';

/**
 * Languages the web shop has translations for (src/assets/i18n/<tag>.json).
 */
export const SUPPORTED_LANGUAGES = [
	'en-US',
	'es-ES',
	'bg-BG',
	'he-IL',
	'ru-RU',
	'fr-FR',
];

export const FALLBACK_LANGUAGE = 'en-US';

/**
 * Maps a browser language or culture ('he', 'es-MX', 'fr_CA') to the
 * supported tag with the same language part. Anything the shop has no
 * translation for, and no value at all, gives en-US.
 */
export function toSupportedLanguage(browserLanguage?: string): string {
	if (!browserLanguage) {
		return FALLBACK_LANGUAGE;
	}

	const languagePart = browserLanguage.split(/[-_]/)[0].toLowerCase();
	const supported = SUPPORTED_LANGUAGES.find(
		(tag) => tag.split('-')[0].toLowerCase() === languagePart
	);

	return supported || FALLBACK_LANGUAGE;
}

/**
 * The supported language that matches the visitor's browser: its culture
 * ('he-IL') when the browser reports one, else its language ('he').
 */
export function getBrowserLanguage(translate: TranslateService): string {
	return toSupportedLanguage(
		translate.getBrowserCultureLang() || translate.getBrowserLang()
	);
}
