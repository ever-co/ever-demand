// TYPES
export type supportedLangType = 'bg-BG' | 'en-US' | 'es-ES' | 'he-IL' | 'ru-RU';
export type supportedLangsType = {
	readonly [name in supportedLangType]: supportedLangType;
};
export type TranslationStateType = {
	lang: supportedLangType;
};
