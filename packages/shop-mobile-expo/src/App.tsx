import "react-native-gesture-handler";
import React from "react";
import { Provider } from "react-redux";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { setCustomTextInput, setCustomText } from "react-native-global-props";
import AppLoading from "expo-app-loading";
import { useFonts } from "expo-font";

// STORE
import { store } from "./store";

// ROUTER
import Router from "./router";

// COMPONENTS
import Icon from "./components/Icon";

// STYLES
import { CONSTANT_COLOR as CC, GLOBAL_STYLE as GS } from "./assets/ts/styles";

// LOCAL TYPES
export type ThemeType = typeof DefaultTheme;

const theme: ThemeType = {
	...DefaultTheme,
	dark: false,
	mode: "adaptive",
	roundness: 4,
	colors: {
		...DefaultTheme.colors,
		primary: CC.primary,
		accent: CC.primaryLight,
		background: CC.light,
		surface: CC.white,
		disabled: CC.grayHighLight,
		placeholder: CC.grayLight,
		error: CC.danger,
	},
	fonts: {
		thin: GS.FF_NunitoExtraLight,
		light: GS.FF_NunitoLight,
		regular: GS.FF_Nunito,
		medium: GS.FF_NunitoSemiBold,
	},
};

setCustomTextInput({
	style: {
		...GS.FF_Nunito,
	},
});

setCustomText({
	style: {
		...GS.FF_Nunito,
	},
});

export default function App() {
	const [fontsLoaded] = useFonts({
		"Nunito-ExtraLight": require("./assets/fonts/Nunito/Nunito-ExtraLight.ttf"),
		"Nunito-Light": require("./assets/fonts/Nunito/Nunito-Light.ttf"),
		"Nunito-Regular": require("./assets/fonts/Nunito/Nunito-Regular.ttf"),
		"Nunito-SemiBold": require("./assets/fonts/Nunito/Nunito-SemiBold.ttf"),
		"Nunito-Bold": require("./assets/fonts/Nunito/Nunito-Bold.ttf"),
		"Nunito-Black": require("./assets/fonts/Nunito/Nunito-Black.ttf"),
		"Lobster-Regular": require("./assets/fonts/Lobster/Lobster-Regular.ttf"),
	});

	return !fontsLoaded ? (
		<AppLoading />
	) : (
		<Provider store={store}>
			<PaperProvider
				theme={theme}
				settings={{ icon: (props: any) => <Icon {...props} /> }}
			>
				<Router />
			</PaperProvider>
		</Provider>
	);
}
