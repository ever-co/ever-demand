import { TranslateService } from '@ngx-translate/core';
import {
	getBrowserLanguage,
	SUPPORTED_LANGUAGES,
	toSupportedLanguage,
} from './browser-language';

describe('toSupportedLanguage', () => {
	it("maps 'he' to he-IL", () => {
		expect(toSupportedLanguage('he')).toBe('he-IL');
	});

	it("maps 'es-MX' to es-ES", () => {
		expect(toSupportedLanguage('es-MX')).toBe('es-ES');
	});

	it("maps 'fr' to fr-FR", () => {
		expect(toSupportedLanguage('fr')).toBe('fr-FR');
	});

	it("maps 'en', 'bg' and 'ru' to en-US, bg-BG and ru-RU", () => {
		expect(toSupportedLanguage('en')).toBe('en-US');
		expect(toSupportedLanguage('bg')).toBe('bg-BG');
		expect(toSupportedLanguage('ru')).toBe('ru-RU');
	});

	it('keeps every supported tag as it is', () => {
		SUPPORTED_LANGUAGES.forEach((tag) =>
			expect(toSupportedLanguage(tag)).toBe(tag)
		);
	});

	it("falls back to en-US for 'de'", () => {
		expect(toSupportedLanguage('de')).toBe('en-US');
	});

	it('falls back to en-US for undefined', () => {
		expect(toSupportedLanguage(undefined)).toBe('en-US');
	});
});

describe('getBrowserLanguage', () => {
	const translateWith = (culture: string, language: string) =>
		({
			getBrowserCultureLang: () => culture,
			getBrowserLang: () => language,
		} as unknown as TranslateService);

	it('uses the browser culture when there is one', () => {
		expect(getBrowserLanguage(translateWith('he-IL', 'he'))).toBe('he-IL');
	});

	it('uses the browser language when there is no culture', () => {
		expect(getBrowserLanguage(translateWith(undefined, 'ru'))).toBe(
			'ru-RU'
		);
	});

	it('falls back to en-US when the browser reports nothing', () => {
		expect(getBrowserLanguage(translateWith(undefined, undefined))).toBe(
			'en-US'
		);
	});
});
