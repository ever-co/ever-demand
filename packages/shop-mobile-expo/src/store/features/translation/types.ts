// LANGUAGES
import LANGUAGES from "./lang";

// TYPES
export type supportedLangType = "bg_BG" | "en_US" | "es_ES" | "he_IL" | "ru_RU";
export type supportedLangsType = {
	readonly [name in supportedLangType]: supportedLangType;
};
export type supportedLangsObjectType = {
	readonly [name in supportedLangType]: typeof LANGUAGES;
};
export type TranslationStateType = {
	lang: supportedLangType;
};
