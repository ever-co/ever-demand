import 'react-native-gesture-handler';
import React from 'react';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';

// ROUTER
import Router from './router';

// COMPONENTS
import ReduxProvider from './components/Providers/Redux';
import ApolloProvider from './components/Providers/Apollo';
import PaperProvider from './components/Providers/Paper';
import AppProvider from './components/Providers/App';

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

	return !fontsLoaded ? (
		<AppLoading />
	) : (
		<ReduxProvider>
			<ApolloProvider>
				<PaperProvider>
					<AppProvider>
						<Router />
					</AppProvider>
				</PaperProvider>
			</ApolloProvider>
		</ReduxProvider>
	);
}
