import { ApolloProvider } from '@apollo/client/react';
import { getLocales } from 'expo-localization';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { createI18n, isRtl, resolveStartLanguage } from './i18n';
import { initialRoute } from './navigation/guards';
import { RootNavigator } from './navigation/RootNavigator';
import type { RouteName } from './navigation/types';
import { bootstrap } from './services/bootstrap';
import { createServices, ServicesProvider, type Services } from './services/container';
import { createAppStore, type AppStore } from './store';
import { hydrateSession, persistSession } from './store/persist';
import { sessionActions } from './store/session';
import { colors, paperTheme } from './theme';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

function deviceLanguage(): string | null {
	try {
		return getLocales()[0]?.languageTag ?? null;
	} catch {
		return null;
	}
}

/** Mirrors the language on `<html dir lang>` in the web build (the Ionic language page did it). */
function applyDocumentLanguage(language: string) {
	if (Platform.OS === 'web' && typeof document !== 'undefined') {
		document.documentElement.dir = isRtl(language) ? 'rtl' : 'ltr';
		document.documentElement.lang = language.slice(0, 2);
	}
}

export interface AppRootProps {
	services: Services;
	store: AppStore;
	/** Skip storage and the start-up checks (tests render screens directly). */
	skipBootstrap?: boolean;
	initialRouteName?: RouteName;
}

export function AppRoot({ services, store, skipBootstrap = false, initialRouteName }: AppRootProps) {
	const [i18n] = useState(() => createI18n());
	const [route, setRoute] = useState<RouteName | null>(initialRouteName ?? null);

	useEffect(() => {
		let active = true;
		const unsubscribePersist = skipBootstrap ? () => undefined : persistSession(store);

		(async () => {
			if (!skipBootstrap) {
				await hydrateSession(store);
			}
			const session = store.getState().session;
			const language = resolveStartLanguage(session.language, services.env.DEFAULT_LANGUAGE, deviceLanguage());
			store.dispatch(sessionActions.setLanguage(language));

			if (!skipBootstrap) {
				await bootstrap(services, store);
			}
			if (active) {
				setRoute((current) => current ?? initialRoute(store.getState().session));
			}
			await SplashScreen.hideAsync().catch(() => undefined);
		})();

		// Language changes (language page) switch the texts and the direction.
		let lastLanguage: string | null = null;
		const unsubscribeLanguage = store.subscribe(() => {
			const language = store.getState().session.language;
			if (language && language !== lastLanguage) {
				lastLanguage = language;
				void i18n.changeLanguage(language);
				applyDocumentLanguage(language);
			}
		});

		return () => {
			active = false;
			unsubscribePersist();
			unsubscribeLanguage();
		};
	}, [i18n, services, skipBootstrap, store]);

	return (
		<GestureHandlerRootView style={styles.root}>
			<ReduxProvider store={store}>
				<ServicesProvider services={services}>
					<ApolloProvider client={services.apollo}>
						<I18nextProvider i18n={i18n}>
							<SafeAreaProvider>
								<PaperProvider theme={paperTheme}>
									<StatusBar style='light' />
									{route ? (
										<RootNavigator initialRouteName={route} />
									) : (
										<View style={styles.loading} testID='app-loading'>
											<ActivityIndicator color={colors.light} />
										</View>
									)}
								</PaperProvider>
							</SafeAreaProvider>
						</I18nextProvider>
					</ApolloProvider>
				</ServicesProvider>
			</ReduxProvider>
		</GestureHandlerRootView>
	);
}

export default function App() {
	const [services] = useState(() => createServices());
	const [store] = useState(() => createAppStore());
	useEffect(() => () => services.dispose(), [services]);
	return <AppRoot services={services} store={store} />;
}

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: colors.primary },
	loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
});
