import React from "react";
import { Provider } from "react-redux";
import Icon from "@expo/vector-icons/AntDesign";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { setCustomTextInput, setCustomText } from "react-native-global-props";

// STORE
import { store } from "./store";

// ROUTER
import Router from "./router";

// STYLES
import { CONSTANT_COLOR as CC, GLOBAL_STYLE as GS } from "./assets/ts/styles";

type ThemeType = typeof DefaultTheme;

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
};

setCustomTextInput({
	style: {},
});

setCustomText({
	style: {},
});

export default function App() {
	return (
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
