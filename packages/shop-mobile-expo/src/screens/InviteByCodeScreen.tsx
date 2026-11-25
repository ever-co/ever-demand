/** First run: invite by code (`/invite/by-code`, feature inventory §4.2). */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { firstValueFrom } from 'rxjs';
import type { Invite } from '../domain/types';
import { useGuard } from '../hooks/useGuard';
import { useRegister } from '../hooks/useRegister';
import { useServices } from '../services/container';
import { toLocation } from '../services/location';
import { useAppSelector } from '../store';
import { colors } from '../theme';
import { notify } from '../utils/alert';

const LOGO = require('../assets/img/ever/logo.png');

/** The dev invite code builds its invite locally (`FAKE_INVITE_*`), at the default coordinates. */
export function fakeInvite(env: ReturnType<typeof useServices>['env']): Invite | null {
	const fake = env.FAKE_INVITE;
	if (!fake) {
		return null;
	}
	return {
		_id: fake.ID,
		id: fake.ID,
		apartment: fake.APARTMENT,
		code: `${fake.CODE}`,
		geoLocation: {
			_id: fake.ID,
			loc: { type: 'Point', coordinates: [env.DEFAULT_LONGITUDE ?? 0, env.DEFAULT_LATITUDE ?? 0] },
			city: fake.CITY,
			postcode: fake.POSTCODE,
			streetAddress: fake.ADDRESS,
			house: fake.HOUSE,
			countryId: fake.COUNTRY_ID,
			_createdAt: fake.CREATED_AT,
			_updatedAt: fake.UPDATED_AT,
		},
		_createdAt: fake.CREATED_AT,
		_updatedAt: fake.UPDATED_AT,
	};
}

export function InviteByCodeScreen() {
	const allowed = useGuard('InviteByCode');
	const { t } = useTranslation();
	const navigation = useNavigation();
	const services = useServices();
	const { env, routers, graphql } = services;
	const register = useRegister();
	const inviteRequestId = useAppSelector((state) => state.session.inviteRequestId);
	const inviteAddress = useAppSelector((state) => state.session.inviteAddress);
	const [code, setCode] = useState('');
	const [busy, setBusy] = useState(false);
	const registered = useRef(false);

	const submit = async (value: number) => {
		if (registered.current) {
			return;
		}
		setBusy(true);
		try {
			const fake = env.FAKE_INVITE;
			if (fake && value === fake.CODE) {
				const invite = fakeInvite(env);
				if (invite) {
					const userId = await register(invite);
					registered.current = true;
					// Seed demo orders for the dev user.
					graphql.generateOrdersByCustomerId(40, userId).catch((error) => console.warn(error));
				}
				return;
			}

			const coords = await services.location.getDeviceCoords();
			const invite = await firstValueFrom(
				routers.invite.getByCode({
					location: coords ? toLocation(coords) : undefined,
					inviteCode: `${value}`,
				}),
			);
			if (invite) {
				await register(invite);
				registered.current = true;
			} else {
				notify(t('EXPO.WRONG_CODE'));
			}
		} catch (error) {
			console.error(error);
		} finally {
			setBusy(false);
		}
	};

	const onChange = (text: string) => {
		const digits = text.replace(/\D/g, '').slice(0, 4);
		const value = Number(digits);
		if (digits.length === 4 && value >= 1000 && value <= 9999) {
			setCode('');
			void submit(value);
		} else {
			setCode(digits);
		}
	};

	if (!allowed) {
		return <View style={styles.screen} />;
	}

	return (
		<KeyboardAvoidingView
			style={styles.screen}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			testID='invite-by-code-screen'>
			<View style={styles.logo}>
				<Image
					source={env.INVITE_BY_CODE_LOGO ? { uri: env.INVITE_BY_CODE_LOGO } : LOGO}
					style={styles.logoImage}
					resizeMode='contain'
					accessibilityLabel='Ever'
				/>
				<Text style={styles.details}>{t('INVITE_VIEW.BY_CODE.LOGO.DETAILS')}</Text>
			</View>

			<View style={styles.content}>
				{!inviteRequestId ? (
					<View style={styles.options}>
						<Button
							mode='contained'
							onPress={() => navigation.navigate('InviteByLocation' as never)}
							testID='get-in-by-address-button'>
							{t('INVITE_VIEW.GET_IN_BY_ADDRESS')}
						</Button>
						<View style={styles.social}>
							<Button mode='contained' buttonColor='#3b5998' style={styles.flex} accessibilityLabel='Facebook'>
								<MaterialCommunityIcons name='facebook' size={18} color={colors.white} />
							</Button>
							<Button mode='contained' buttonColor='#dd4b39' style={styles.flex} accessibilityLabel='Google'>
								<MaterialCommunityIcons name='google' size={18} color={colors.white} />
							</Button>
						</View>
						<Text style={styles.or}>
							{t('OR_LOWERCASE')} <Text style={styles.orWhat}>{t('INVITE_VIEW.BY_CODE.OR_WHAT')}</Text>
						</Text>
					</View>
				) : (
					<View style={styles.options} testID='invite-requested'>
						{!!inviteAddress && (
							<View>
								<Text style={styles.invitedTitle}>{t('INVITE_VIEW.INVITED_TEXT.TITLE')}</Text>
								<Text style={styles.invitedDetails}>{t('INVITE_VIEW.INVITED_TEXT.DETAILS')}</Text>
								<Text style={styles.invitedAddress} testID='invite-address'>
									{inviteAddress}
								</Text>
							</View>
						)}
						<Text style={styles.orWhat}>{t('INVITE_VIEW.BY_CODE.INVITED')}</Text>
					</View>
				)}

				<TextInput
					value={code}
					onChangeText={onChange}
					keyboardType='number-pad'
					maxLength={4}
					editable={!busy}
					placeholder={t('INVITE_VIEW.BY_CODE.INVITE_CODE')}
					placeholderTextColor={colors.medium}
					style={styles.codeInput}
					testID='invite-code-input'
					accessibilityLabel={t('INVITE_VIEW.BY_CODE.INVITE_CODE')}
				/>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.primary, justifyContent: 'center', padding: 24 },
	logo: { alignItems: 'center', marginBottom: 32 },
	logoImage: { width: 160, height: 80 },
	details: { color: colors.light, marginTop: 8 },
	content: { gap: 16 },
	options: { gap: 12 },
	social: { flexDirection: 'row', gap: 8 },
	flex: { flex: 1 },
	or: { color: colors.medium, textAlign: 'center' },
	orWhat: { color: colors.light, textAlign: 'center' },
	invitedTitle: { color: '#cccccc', fontSize: 18, textAlign: 'center' },
	invitedDetails: { color: '#888888', textAlign: 'center' },
	invitedAddress: { color: '#bbbbbb', fontSize: 18, textAlign: 'center' },
	codeInput: {
		backgroundColor: colors.white,
		color: colors.dark,
		fontSize: 24,
		textAlign: 'center',
		paddingVertical: 12,
		borderRadius: 4,
		letterSpacing: 8,
	},
});
