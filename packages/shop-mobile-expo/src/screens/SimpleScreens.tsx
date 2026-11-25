/** Language, info pages and the connection / server / maintenance pages (§3.4, §4.1, §4.15). */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../components/AppHeader';
import { HtmlView } from '../components/HtmlView';
import { LANGUAGES, type Language } from '../domain/enums';
import { useGuard } from '../hooks/useGuard';
import { useObservable } from '../hooks/useObservable';
import { goBack, navigateRoot } from '../navigation/actions';
import { initialRoute } from '../navigation/guards';
import type { RouteName } from '../navigation/types';
import { checkServer, fetchMaintenanceInfo, maintenanceStatusOf } from '../services/bootstrap';
import { useServices } from '../services/container';
import { useAppDispatch, useAppSelector, useAppStore } from '../store';
import { sessionActions } from '../store/session';
import { colors } from '../theme';

const LOGO = require('../assets/img/ever/logo.png');

const LANGUAGE_LABELS: Record<Language, string> = {
	'en-US': 'ENGLISH',
	'bg-BG': 'BULGARIAN',
	'he-IL': 'HEBREW',
	'ru-RU': 'RUSSIAN',
	'es-ES': 'SPANISH',
	'fr-FR': 'FRENCH',
};

export function LanguageScreen() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const language = useAppSelector((state) => state.session.language) ?? 'en-US';

	const choose = (lang: string) => {
		dispatch(sessionActions.setLanguage(lang as Language));
		goBack();
	};

	return (
		<View style={styles.screen} testID='language-screen'>
			<AppHeader title={t('LANGUAGE_VIEW.TITLE')} onBack={() => goBack()} />
			<RadioButton.Group onValueChange={choose} value={language}>
				{LANGUAGES.map((lang) => (
					<RadioButton.Item
						key={lang}
						label={t(LANGUAGE_LABELS[lang])}
						value={lang}
						labelStyle={styles.radioLabel}
						testID={`language-${lang}`}
					/>
				))}
			</RadioButton.Group>
		</View>
	);
}

type InfoKind = 'About' | 'Help' | 'Privacy' | 'TermsOfUse';

const INFO: Record<InfoKind, { title: string; method: 'getAboutUs' | 'getHelp' | 'getPrivacy' | 'getTermsOfUse' }> = {
	About: { title: 'ABOUT_VIEW.TITLE', method: 'getAboutUs' },
	Help: { title: 'HELP_VIEW.TITLE', method: 'getHelp' },
	Privacy: { title: 'PRIVACY_VIEW.TITLE', method: 'getPrivacy' },
	TermsOfUse: { title: 'TERMS_OF_USE_VIEW.TITLE', method: 'getTermsOfUse' },
};

/** Server HTML pages (`user.getAboutUs` / `getHelp` / `getPrivacy` / `getTermsOfUse`). */
export function InfoScreen({ kind }: { kind: InfoKind }) {
	const allowed = useGuard(kind);
	const { t } = useTranslation();
	const { routers } = useServices();
	const userId = useAppSelector((state) => state.session.userId);
	const deviceId = useAppSelector((state) => state.session.deviceId);
	const language = useAppSelector((state) => state.session.language) ?? 'en-US';
	const { method, title } = INFO[kind];
	const html = useObservable<string>(() => routers.user[method](userId, deviceId, language), [method, userId, deviceId, language]).value;

	if (!allowed) {
		return <View style={styles.screen} />;
	}

	return (
		<View style={styles.screen} testID={`info-screen-${kind}`}>
			<AppHeader title={t(title)} />
			<HtmlView html={html ?? '<h1>Loading...</h1>'} testID='info-html' />
		</View>
	);
}

export const AboutScreen = () => <InfoScreen kind='About' />;
export const HelpScreen = () => <InfoScreen kind='Help' />;
export const PrivacyScreen = () => <InfoScreen kind='Privacy' />;
export const TermsOfUseScreen = () => <InfoScreen kind='TermsOfUse' />;

function ErrorPage({ testID, children }: { testID: string; children: React.ReactNode }) {
	const { env } = useServices();
	return (
		<ScrollView contentContainerStyle={styles.error} testID={testID}>
			<Image
				source={env.NO_INTERNET_LOGO ? { uri: env.NO_INTERNET_LOGO } : LOGO}
				style={styles.errorLogo}
				resizeMode='contain'
				accessibilityLabel={`${env.COMPANY_NAME} Logo`}
			/>
			{children}
		</ScrollView>
	);
}

/** Network lost (`/errors/connection-lost`); the app goes back when the network returns. */
export function ConnectionLostScreen() {
	const { t } = useTranslation();
	return (
		<ErrorPage testID='connection-lost-screen'>
			<Text style={styles.errorTitle}>{t('CONNECTION_ERROR_VIEW.TITLE')}</Text>
			<Text style={styles.errorText}>
				{t('CONNECTION_ERROR_VIEW.DESCRIPTION.0')}
				{'\n'}
				{t('CONNECTION_ERROR_VIEW.DESCRIPTION.1')}
				{'\n'}
				{t('CONNECTION_ERROR_VIEW.DESCRIPTION.2')}
			</Text>
			<ActivityIndicator color={colors.light} />
		</ErrorPage>
	);
}

const RETRY_MS = 5000;

/** Server down at start (`/server-down`): checks again every 5 s. */
export function ServerDownScreen({ retryMs = RETRY_MS }: { retryMs?: number }) {
	const { t } = useTranslation();
	const services = useServices();
	const store = useAppStore();

	useEffect(() => {
		const timer = setInterval(async () => {
			const status = await checkServer(services);
			store.dispatch(sessionActions.setServerConnection(status));
			if (status !== 0) {
				clearInterval(timer);
				navigateRoot(initialRoute(store.getState().session) as RouteName);
			}
		}, retryMs);
		return () => clearInterval(timer);
	}, [retryMs, services, store]);

	return (
		<ErrorPage testID='server-down-screen'>
			<Text style={styles.errorTitle}>{t('NO_SERVER_VIEW.NO_SERVER')}</Text>
			<MaterialCommunityIcons name='server-off' size={48} color={colors.medium} />
		</ErrorPage>
	);
}

/** Maintenance (`/maintenance-info`): shows the message, checks again every 5 s. */
export function MaintenanceScreen({ retryMs = RETRY_MS }: { retryMs?: number }) {
	const allowed = useGuard('Maintenance');
	const { t } = useTranslation();
	const services = useServices();
	const store = useAppStore();
	const mode = useAppSelector((state) => state.session.maintenanceMode);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		fetchMaintenanceInfo(services).then((info) => {
			const entry = info?.find((m) => m.type === mode);
			if (active && entry) {
				setMessage(entry.message);
			}
		});
		const timer = setInterval(async () => {
			const info = await fetchMaintenanceInfo(services);
			if (!maintenanceStatusOf(info, services.env.SETTINGS_APP_TYPE)) {
				clearInterval(timer);
				store.dispatch(sessionActions.setMaintenanceMode(null));
				navigateRoot(initialRoute(store.getState().session));
			}
		}, retryMs);
		return () => {
			active = false;
			clearInterval(timer);
		};
	}, [mode, retryMs, services, store]);

	if (!allowed) {
		return <View style={styles.screen} />;
	}

	return (
		<ErrorPage testID='maintenance-screen'>
			<Text style={styles.errorTitle}>{t('EXPO.MAINTENANCE.TITLE')}</Text>
			{!!message && (
				<Text style={styles.errorText} testID='maintenance-message'>
					{message}
				</Text>
			)}
		</ErrorPage>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.dark },
	radioLabel: { color: colors.light },
	error: {
		flexGrow: 1,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 24,
		gap: 16,
	},
	errorLogo: { width: 160, height: 80 },
	errorTitle: { color: colors.light, fontSize: 22, textAlign: 'center' },
	errorText: { color: colors.light, fontSize: 16, textAlign: 'center' },
});
