import type { Language } from '../domain/enums';
import { FALLBACK_LANGUAGE } from '../i18n';
import { useAppSelector } from '../store';

/** The app language (`Store.language`). */
export function useLanguage(): Language {
	return useAppSelector((state) => state.session.language) ?? FALLBACK_LANGUAGE;
}
