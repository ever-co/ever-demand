/** The signed-up customer and the chosen locale, kept in localStorage. */
export interface StoredUser {
	id?: string;
	token?: string;
}

export const isBrowser = () => typeof window !== 'undefined';

export const getUser = (): StoredUser => {
	if (!isBrowser()) {
		return {};
	}
	try {
		return JSON.parse(window.localStorage.getItem('user') || '{}') || {};
	} catch {
		return {};
	}
};

export const setUser = (user: StoredUser): StoredUser => {
	if (isBrowser()) {
		window.localStorage.setItem('user', JSON.stringify(user));
	}
	return user;
};

export const DEFAULT_LOCALE = 'en-US';

export const getlocale = (): string =>
	(isBrowser() && window.localStorage.getItem('locale')) || DEFAULT_LOCALE;

export const setlocale = (locale: string): string => {
	if (isBrowser()) {
		window.localStorage.setItem('locale', locale);
	}
	return locale;
};

export const isLoggedIn = () => !!getUser().id;

export const logout = (callback: () => void) => {
	setUser({});
	callback();
};

const auth = {
	isBrowser,
	getUser,
	setUser,
	getlocale,
	setlocale,
	isLoggedIn,
	logout,
};

export default auth;
