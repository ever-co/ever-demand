import 'react-native-gesture-handler';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { setCustomTextInput, setCustomText } from 'react-native-global-props';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import FlashMessage from 'react-native-flash-message';

// ENVIRONMENT
import ENV from './environments/environment';

// STORE
import { store } from './store';

// ROUTER
import Router from './router';

// COMPONENTS
import { Icon } from './components/Common';

// STYLES
import {
	CONSTANT_COLOR as CC,
	GLOBAL_STYLE as GS,
	CONSTANT_SIZE as CS,
} from './assets/ts/styles';

// LOCAL TYPES
export type PaperThemeType = typeof DefaultTheme;

// Initialize Apollo Client
const apolloClient = new ApolloClient({
	uri: ENV.GQL_ENDPOINT,
	cache: new InMemoryCache(),
	defaultOptions: { watchQuery: { fetchPolicy: 'cache-and-network' } },
});

const paperTheme: PaperThemeType = {
	...DefaultTheme,
	dark: false,
	mode: 'adaptive',
	roundness: CS.SPACE - 4,
	colors: {
		...DefaultTheme.colors,
		primary: CC.primary,
		accent: CC.secondary,
		background: CC.primary,
		surface: CC.white,
		disabled: CC.grayLight,
		text: CC.light,
		placeholder: CC.grayHighLight,
		error: CC.danger,
	},
	fonts: {
		thin: GS.FF_NunitoExtraLight,
		light: GS.FF_NunitoLight,
		regular: GS.FF_Nunito,
		medium: GS.FF_NunitoSemiBold,
	},
};

export default function App() {
	const [fontsLoaded] = useFonts({
		'Nunito-ExtraLight': require('./assets/fonts/Nunito/Nunito-ExtraLight.ttf'),
		'Nunito-Light': require('./assets/fonts/Nunito/Nunito-Light.ttf'),
		'Nunito-Regular': require('./assets/fonts/Nunito/Nunito-Regular.ttf'),
		'Nunito-SemiBold': require('./assets/fonts/Nunito/Nunito-SemiBold.ttf'),
		'Nunito-Bold': require('./assets/fonts/Nunito/Nunito-Bold.ttf'),
		'Nunito-Black': require('./assets/fonts/Nunito/Nunito-Black.ttf'),
		'Lobster-Regular': require('./assets/fonts/Lobster/Lobster-Regular.ttf'),
	});

	React.useEffect(() => {
		if (fontsLoaded) {
			setCustomTextInput({
				style: {
					...GS.FF_Nunito,
					color: CC.light,
				},
			});

			setCustomText({
				style: {
					...GS.FF_Nunito,
					color: CC.light,
				},
			});
		}
	}, [fontsLoaded]);

	return !fontsLoaded ? (
		<AppLoading />
	) : (
		<ApolloProvider client={apolloClient}>
			<ReduxProvider store={store}>
				<PaperProvider
					theme={paperTheme}
					settings={{ icon: (props: any) => <Icon {...props} /> }}>
					<Router />
					<FlashMessage position='bottom' />
				</PaperProvider>
			</ReduxProvider>
		</ApolloProvider>
	);
}
