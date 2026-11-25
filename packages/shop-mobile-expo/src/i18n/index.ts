/**
 * i18next with the Ionic app's translation files (copied verbatim into `locales/`). Keys and
 * `{{param}}` interpolation are the same as ngx-translate; arrays are read with numeric keys
 * (`BUY_POPUP.STATUSES.0.TITLE`). Missing keys fall back to `en-US`.
 */
import i18next, { type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES, type Language, RTL_LANGUAGES } from '../domain/enums';
import bgBG from './locales/bg-BG.json';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';
import frFR from './locales/fr-FR.json';
import heIL from './locales/he-IL.json';
import ruRU from './locales/ru-RU.json';

/**
 * Texts the Expo app needs that the Ionic files do not have (the Stripe Checkout popup brought
 * its own). English only; the other languages fall back to it.
 */
const expoExtras = {
	EXPO: {
		CARD: {
			TITLE: 'Pay with card',
			EMAIL: 'Email',
			CARD_DETAILS: 'Card details',
			INCOMPLETE: 'Please enter a valid email and the card details.',
			NOT_AVAILABLE: 'Card payments are not available in this build.',
		},
		MAINTENANCE: {
			TITLE: 'We are under maintenance',
		},
		MAP: {
			OPEN_IN_MAPS: 'Open in maps',
			CUSTOMER: 'You',
			STORE: 'Store',
			CARRIER: 'Carrier',
		},
		SCAN: {
			NO_PERMISSION: 'Camera permission is needed to scan a store code.',
			NOT_SUPPORTED: 'Scanning is not supported on this device.',
		},
		ORDER_INFO_MODAL: {
			TITLE: 'Order Info',
			CONFIRM: 'Confirm',
			ADD_MORE: 'Add More',
			ADD_COMMENT: 'Add Comment',
			COMMENT: 'Comment',
		},
		COUNTRY: 'Country',
		NO_APARTMENT: 'No apartment',
		WRONG_CODE: 'Wrong code!',
	},
};

export const resources = {
	'en-US': { translation: { ...enUS, ...expoExtras } },
	'bg-BG': { translation: bgBG },
	'he-IL': { translation: heIL },
	'ru-RU': { translation: ruRU },
	'es-ES': { translation: esES },
	'fr-FR': { translation: frFR },
} as const;

export const FALLBACK_LANGUAGE: Language = 'en-US';

export function isLanguage(value: string | null | undefined): value is Language {
	return !!value && (LANGUAGES as readonly string[]).includes(value);
}

export function isRtl(language: string | null | undefined): boolean {
	return !!language && (RTL_LANGUAGES as readonly string[]).includes(language);
}

/** Maps a device / browser language (`he`, `ru-RU`, ...) to a supported language by its prefix. */
export function matchLanguage(tag: string | null | undefined): Language | null {
	if (!tag) {
		return null;
	}
	if (isLanguage(tag)) {
		return tag;
	}
	const prefix = tag.slice(0, 2).toLowerCase();
	return LANGUAGES.find((language) => language.startsWith(prefix)) ?? null;
}

/**
 * Start language: the stored choice, else `DEFAULT_LANGUAGE`, else the device language, else
 * `en-US`. (The Ionic app let `DEFAULT_LANGUAGE` win over the stored choice, fleet task T-2805
 * fixes that; this follows the fixed order.)
 */
export function resolveStartLanguage(
	stored: string | null | undefined,
	defaultLanguage: string | null | undefined,
	deviceLanguage: string | null | undefined,
): Language {
	return (
		(isLanguage(stored) ? stored : null) ||
		matchLanguage(defaultLanguage) ||
		matchLanguage(deviceLanguage) ||
		FALLBACK_LANGUAGE
	);
}

export function createI18n(language: Language = FALLBACK_LANGUAGE): I18n {
	const instance = i18next.createInstance();
	void instance.use(initReactI18next).init({
		resources,
		lng: language,
		fallbackLng: FALLBACK_LANGUAGE,
		supportedLngs: [...LANGUAGES],
		interpolation: { escapeValue: false },
		// ngx-translate returns "" for empty values (e.g. PRODUCTS_VIEW.BUY_BUTTON.SUF), not the key.
		returnEmptyString: true,
		returnNull: false,
		initAsync: false,
	});
	return instance;
}
