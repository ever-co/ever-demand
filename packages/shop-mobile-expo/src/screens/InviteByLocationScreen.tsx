/** First run: invite by address (`/invite/by-location`, feature inventory §4.3). */
import { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { Button, Checkbox, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { firstValueFrom } from 'rxjs';
import { COUNTRIES } from '../domain/countries.data';
import { countryIdByAbbreviation, countryName, inviteRequestAddress } from '../domain/order';
import { useGuard } from '../hooks/useGuard';
import { useRegister } from '../hooks/useRegister';
import { navigateRoot } from '../navigation/actions';
import { useServices } from '../services/container';
import { useAppDispatch, useAppStore } from '../store';
import { sessionActions } from '../store/session';
import { colors } from '../theme';
import { notify } from '../utils/alert';

/** `Country.IL`, the Ionic default. */
export const DEFAULT_COUNTRY_ID = countryIdByAbbreviation('IL') ?? 102;

export interface AddressForm {
	city: string;
	streetAddress: string;
	house: string;
	apartment: string;
	isApartment: boolean;
	countryId: number;
	notes: string;
}

/** `isValid`: city and street set, house and country non-zero numbers, apartment or "no apartment". */
export function isAddressValid(form: AddressForm): boolean {
	const notEmpty = (s: string) => typeof s === 'string' && s.trim() !== '';
	const nonZero = (n: number) => Number.isFinite(n) && n !== 0;
	return (
		notEmpty(form.city) &&
		notEmpty(form.streetAddress) &&
		nonZero(Number(form.house)) &&
		Number.isFinite(form.countryId) &&
		form.countryId !== 0 &&
		(nonZero(Number(form.apartment)) || !form.isApartment)
	);
}

export function InviteByLocationScreen() {
	const allowed = useGuard('InviteByLocation');
	const { t } = useTranslation();
	const services = useServices();
	const { routers, env } = services;
	const store = useAppStore();
	const dispatch = useAppDispatch();
	const register = useRegister();

	const [detecting, setDetecting] = useState(true);
	const [busy, setBusy] = useState(false);
	const [showNotes, setShowNotes] = useState(false);
	const [countryQuery, setCountryQuery] = useState<string | null>(null);
	const [form, setForm] = useState<AddressForm>({
		city: '',
		streetAddress: '',
		house: '',
		apartment: '',
		isApartment: true,
		countryId: DEFAULT_COUNTRY_ID,
		notes: '',
	});
	const update = (values: Partial<AddressForm>) => setForm((prev) => ({ ...prev, ...values }));

	// Prefill from the current location (50 ms after open in the Ionic app).
	useEffect(() => {
		let active = true;
		const timer = setTimeout(async () => {
			try {
				const coords =
					env.DEFAULT_LATITUDE && env.DEFAULT_LONGITUDE
						? { latitude: env.DEFAULT_LATITUDE, longitude: env.DEFAULT_LONGITUDE }
						: await services.location.getDeviceCoords();
				if (!coords) {
					return;
				}
				const address = await routers.geoLocation.getAddressByCoordinatesUsingArcGIS(
					coords.latitude,
					coords.longitude,
				);
				if (address && active) {
					setForm((prev) => ({
						...prev,
						city: prev.city || address.locality || '',
						streetAddress: prev.streetAddress || address.thoroughfare || '',
						countryId: countryIdByAbbreviation(address.country) ?? prev.countryId,
					}));
				}
			} catch (error) {
				// The customer types the address instead.
				console.warn("Can't detect location", error);
			} finally {
				if (active) {
					setDetecting(false);
				}
			}
		}, 50);
		return () => {
			active = false;
			clearTimeout(timer);
		};
	}, [env.DEFAULT_LATITUDE, env.DEFAULT_LONGITUDE, routers, services.location]);

	const countryMatches = useMemo(() => {
		if (countryQuery == null || countryQuery.trim() === '') {
			return [];
		}
		const query = countryQuery.trim().toLowerCase();
		return COUNTRIES.map(([abbr, name], id) => ({ abbr, name: name ?? abbr, id }))
			.filter((c) => c.name.toLowerCase().startsWith(query) || c.abbr.toLowerCase() === query)
			.slice(0, 5);
	}, [countryQuery]);

	const login = async () => {
		if (!isAddressValid(form)) {
			notify(t('INVITE_VIEW.INFO_MISSING'));
			return;
		}
		setBusy(true);
		const apartment = form.isApartment ? `${Number(form.apartment)}` : '0';
		const house = `${Number(form.house)}`;
		try {
			const invite = await firstValueFrom(
				routers.invite.getByLocation({
					apartment,
					house,
					streetAddress: form.streetAddress.trim(),
					city: form.city.trim(),
					countryId: form.countryId,
					notes: form.notes,
				}),
			);
			if (invite) {
				await register(invite);
				return;
			}

			// No invite at this address: ask for one, at the address' coordinates (the Ionic app used the
			// Google geocoder), else at the current location.
			const coords =
				(await services.location.geocodeAddress(
					`${form.streetAddress.trim()} ${house}, ${form.city.trim()}, ${countryName(form.countryId) ?? ''}`,
				)) ?? (await services.location.getCurrentCoords());
			const request = await routers.inviteRequest.create({
				geoLocation: {
					loc: { type: 'Point', coordinates: [coords.longitude, coords.latitude] },
					countryId: form.countryId,
					city: form.city.trim(),
					streetAddress: form.streetAddress.trim(),
					house,
					notes: form.notes,
				},
				apartment,
				deviceId: store.getState().session.deviceId,
			});

			if (store.getState().session.inviteSystem) {
				dispatch(sessionActions.setInviteRequest({ id: request.id, address: inviteRequestAddress(request) }));
				navigateRoot('InviteByCode');
			} else {
				const created = await routers.invite.create(request);
				await register(created);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setBusy(false);
		}
	};

	if (!allowed) {
		return <View style={styles.screen} />;
	}

	return (
		<KeyboardAvoidingView
			style={styles.screen}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			testID='invite-by-location-screen'>
			<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
				<Text style={styles.title}>{t('INVITE_VIEW.YOUR_ADDRESS')}</Text>
				<Text style={styles.subtitle}>{t('INVITE_VIEW.LAUNCH_NOTIFICATION')}</Text>

				{detecting ? (
					<View style={styles.detecting} testID='detecting-location'>
						<Text style={styles.detectingText}>{t('INVITE_VIEW.DETECTING_LOCATION')}</Text>
						<ActivityIndicator color={colors.light} />
					</View>
				) : (
					<View style={styles.form}>
						<TextInput
							mode='outlined'
							label={t('EXPO.COUNTRY')}
							value={countryQuery ?? countryName(form.countryId) ?? ''}
							onFocus={() => setCountryQuery('')}
							onChangeText={setCountryQuery}
							onBlur={() => setTimeout(() => setCountryQuery(null), 200)}
							testID='country-input'
						/>
						{countryMatches.map((country) => (
							<Pressable
								key={country.id}
								onPress={() => {
									update({ countryId: country.id });
									setCountryQuery(null);
								}}
								style={styles.suggestion}
								testID={`country-option-${country.abbr}`}>
								<Text style={styles.suggestionText}>{country.name}</Text>
							</Pressable>
						))}
						<TextInput
							mode='outlined'
							label={t('CITY')}
							value={form.city}
							onChangeText={(city) => update({ city })}
							testID='city-input'
						/>
						{!!form.city && (
							<TextInput
								mode='outlined'
								label={t('STREET')}
								value={form.streetAddress}
								onChangeText={(streetAddress) => update({ streetAddress })}
								testID='street-input'
							/>
						)}
						{!!form.city && !!form.streetAddress && (
							<View style={styles.row}>
								<TextInput
									mode='outlined'
									label={t('HOUSE')}
									value={form.house}
									keyboardType='number-pad'
									onChangeText={(house) => update({ house: house.replace(/\D/g, '') })}
									style={styles.flex}
									testID='house-input'
								/>
								{form.isApartment && (
									<TextInput
										mode='outlined'
										label={t('APARTMENT')}
										value={form.apartment}
										keyboardType='number-pad'
										onChangeText={(apartment) => update({ apartment: apartment.replace(/\D/g, '') })}
										style={styles.flex}
										testID='apartment-input'
									/>
								)}
							</View>
						)}
						{!!form.city && !!form.streetAddress && !form.apartment && (
							<Checkbox.Item
								label={t('EXPO.NO_APARTMENT')}
								status={form.isApartment ? 'unchecked' : 'checked'}
								onPress={() => update({ isApartment: !form.isApartment })}
								labelStyle={styles.checkboxLabel}
								testID='no-apartment-toggle'
							/>
						)}
						{!!form.city && !!form.streetAddress && (
							<View>
								<Pressable onPress={() => setShowNotes((v) => !v)} testID='notes-toggle'>
									<Text style={styles.notesLink}>{t('LOCATION_NOTES')}</Text>
								</Pressable>
								{showNotes && (
									<TextInput
										mode='outlined'
										multiline
										numberOfLines={3}
										placeholder={t('ENTER_NOTES_HERE')}
										value={form.notes}
										onChangeText={(notes) => update({ notes })}
										testID='notes-input'
									/>
								)}
							</View>
						)}
						{!!form.house && (!!form.apartment || !form.isApartment) && (
							<Button mode='contained' onPress={() => void login()} loading={busy} disabled={busy} testID='get-in-button'>
								{t('INVITE_VIEW.GET_IN')}
							</Button>
						)}
					</View>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.primary },
	content: { padding: 24, gap: 12 },
	title: { color: colors.light, fontSize: 24, textAlign: 'center' },
	subtitle: { color: colors.medium, textAlign: 'center' },
	detecting: { paddingTop: 50, alignItems: 'center', gap: 12 },
	detectingText: { color: colors.white, fontSize: 16, textAlign: 'center' },
	form: { gap: 8 },
	row: { flexDirection: 'row', gap: 8 },
	flex: { flex: 1 },
	suggestion: { padding: 8, backgroundColor: colors.primaryLight },
	suggestionText: { color: colors.light },
	checkboxLabel: { color: colors.light },
	notesLink: { color: colors.light, textDecorationLine: 'underline', paddingVertical: 4 },
});
