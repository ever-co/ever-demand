// TYPES
import type { supportedLangType } from "../types";

// LANGUAGES
import bg_BG from "./bg-BG.json";
import en_US from "./en-US.json";
import es_ES from "./es-ES.json";
import he_IL from "./he-IL.json";
import ru_RU from "./ru-RU.json";

const LANGUAGES: {
	[name in supportedLangType]:
		| typeof bg_BG
		| typeof en_US
		| typeof es_ES
		| typeof he_IL
		| typeof ru_RU;
} = {
	bg_BG: bg_BG,
	en_US: en_US,
	es_ES: es_ES,
	he_IL: he_IL,
	ru_RU: ru_RU,
};

export default LANGUAGES;
