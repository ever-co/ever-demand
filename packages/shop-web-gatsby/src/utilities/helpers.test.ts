import { matchLocale, LOCALES } from './locale';
import { toUserInput } from './user';
import auth, {
	getUser,
	getlocale,
	isLoggedIn,
	logout,
	setUser,
	setlocale,
} from '../auth/auth';

describe('matchLocale', () => {
	const title = [
		{ locale: 'en-US', value: 'Pizza' },
		{ locale: 'bg-BG', value: 'Пица' },
	];

	it('gives the value in the chosen locale', () => {
		expect(matchLocale(title, 'bg-BG')).toBe('Пица');
	});

	it('compares locales without case (the old default was "en-us")', () => {
		expect(matchLocale(title, 'en-us')).toBe('Pizza');
	});

	it('falls back to the first value', () => {
		expect(matchLocale(title, 'fr-FR')).toBe('Pizza');
	});

	it('gives an empty string without values', () => {
		expect(matchLocale([], 'en-US')).toBe('');
		expect(matchLocale(null)).toBe('');
	});

	it('uses the stored locale by default', () => {
		setlocale('bg-BG');
		expect(matchLocale(title)).toBe('Пица');
	});

	it('offers the six shop locales', () => {
		expect(LOCALES).toEqual([
			'en-US',
			'fr-FR',
			'bg-BG',
			'he-IL',
			'es-ES',
			'ru-RU',
		]);
	});
});

describe('auth', () => {
	it('stores the user and knows when someone is signed up', () => {
		expect(getUser()).toEqual({});
		expect(isLoggedIn()).toBe(false);

		setUser({ id: 'u1' });

		expect(getUser()).toEqual({ id: 'u1' });
		expect(isLoggedIn()).toBe(true);
	});

	it('survives a broken stored user', () => {
		localStorage.setItem('user', '{broken');
		expect(getUser()).toEqual({});
	});

	it('logs out and calls back', () => {
		setUser({ id: 'u1' });
		const done = vi.fn();

		logout(done);

		expect(isLoggedIn()).toBe(false);
		expect(done).toHaveBeenCalled();
	});

	it('defaults to en-US and stores the chosen locale', () => {
		expect(getlocale()).toBe('en-US');
		expect(auth.setlocale('he-IL')).toBe('he-IL');
		expect(getlocale()).toBe('he-IL');
	});
});

describe('toUserInput', () => {
	const address = {
		email: '',
		firstName: 'Ana',
		city: 'Sofia',
		house: '1',
		streetAddress: 'Vitosha',
		apartment: '',
		postcode: '',
		geoLocation: { countryId: 21 },
	};

	it('builds the registration of the address at the visitor location (lng, lat)', () => {
		expect(toUserInput(address, [42.6, 23.3])).toEqual({
			email: undefined,
			firstName: 'Ana',
			lastName: undefined,
			phone: undefined,
			apartment: '0',
			geoLocation: {
				loc: { type: 'Point', coordinates: [23.3, 42.6] },
				city: 'Sofia',
				countryId: 21,
				house: '1',
				postcode: undefined,
				streetAddress: 'Vitosha',
			},
		});
	});

	it('keeps the apartment and turns a selected country into a number', () => {
		const input = toUserInput(
			{ ...address, apartment: '5', geoLocation: { countryId: '3' as any } },
			null,
		);

		expect(input.apartment).toBe('5');
		expect(input.geoLocation.countryId).toBe(3);
		expect(input.geoLocation.loc.coordinates).toEqual([]);
	});
});
