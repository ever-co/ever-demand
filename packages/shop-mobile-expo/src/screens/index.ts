//
import LoadingScreen from './Loading.screen';
import Blank_Screen from './Blank_.screen';

// REGISTRATION
import SignUpScreen from './registration/Signup.screen';
import GeoScreen from './registration/Geo.screen';

// APP
import HomeScreen from './Home.screen';
import TranslationScreen from './Translation.screen';

// TODO: create a type for screens object

const SCREENS = {
	// SCREENS
	Loading: LoadingScreen,
	Blank_: Blank_Screen,
	APP: {
		Home: HomeScreen,
		Translation: TranslationScreen,
	},
	REGISTRATION: {
		SIGN_UP: SignUpScreen,
		GEO: GeoScreen,
	},
};

export default SCREENS;
