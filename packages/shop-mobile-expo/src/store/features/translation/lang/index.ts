// TYPES
import type { supportedLangType } from '../types';

// LANGUAGES
import bg_BG from './bg-BG.json';
import en_US from './en-US.json';
import es_ES from './es-ES.json';
import fr_FR from './fr-FR.json';
import he_IL from './he-IL.json';
import ru_RU from './ru-RU.json';

const LANGUAGES: {
	[name in supportedLangType]:
		| typeof bg_BG
		| typeof en_US
		| typeof es_ES
		| typeof fr_FR
		| typeof he_IL
		| typeof ru_RU;
} = {
	BULGARIAN: bg_BG,
	ENGLISH: en_US,
	SPANISH: es_ES,
	FRENCH: fr_FR,
	HEBREW: he_IL,
	RUSSIAN: ru_RU,
};

export default LANGUAGES;
