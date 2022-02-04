//
import LoadingScreen from './Loading.screen';
import Blank_Screen from './Blank_.screen';

// REGISTRATION
import SignUpScreen from './registration/SignUp.screen';
import GetUserAddressScreen from './registration/GetUserAddress.screen';

// APP
import HomeScreen from './app/Home.screen';
import TranslationScreen from './app/Translation.screen';

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
		GET_USER_ADDRESS: GetUserAddressScreen,
	},
};

export default SCREENS;
