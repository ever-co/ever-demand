// LANGUAGES
import LANGUAGES from './lang';

// TYPES
export type supportedLangType =
	| 'BULGARIAN'
	| 'ENGLISH'
	| 'FRENCH'
	| 'HEBREW'
	| 'RUSSIAN'
	| 'SPANISH';
export type supportedLangsType = {
	readonly [name in supportedLangType]: supportedLangType;
};
export type supportedLangsObjectType = {
	readonly [name in supportedLangType]: typeof LANGUAGES;
};
export type TranslationStateType = {
	lang: supportedLangType;
};
